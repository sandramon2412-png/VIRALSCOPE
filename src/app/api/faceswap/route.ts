import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const COMFYUI_URL = "http://localhost:8188";

// Upload a base64 image to ComfyUI and return the filename
async function uploadImage(base64Data: string, filename: string): Promise<string> {
  // Remove data:image/...;base64, prefix if present
  const clean = base64Data.replace(/^data:image\/[^;]+;base64,/, "");
  const buffer = Buffer.from(clean, "base64");

  // Create form data
  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/png" });
  formData.append("image", blob, filename);
  formData.append("overwrite", "true");

  const res = await fetch(`${COMFYUI_URL}/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} - ${text}`);
  }

  const data = await res.json();
  return data.name; // filename stored in ComfyUI input folder
}

// ReActor face swap workflow using LoadImage nodes
function buildReactorWorkflow(inputImageName: string, faceImageName: string) {
  return {
    "1": {
      class_type: "LoadImage",
      inputs: { image: inputImageName },
    },
    "2": {
      class_type: "LoadImage",
      inputs: { image: faceImageName },
    },
    "3": {
      class_type: "ReActorFaceSwap",
      inputs: {
        enabled: true,
        input_image: ["1", 0],
        source_image: ["2", 0],
        swap_model: "inswapper_128.onnx",
        facedetection: "retinaface_resnet50",
        face_restore_model: "GFPGANv1.3.pth",
        face_restore_visibility: 1,
        codeformer_weight: 0.5,
        detect_gender_input: "no",
        detect_gender_source: "no",
        input_faces_index: "0",
        source_faces_index: "0",
        console_log_level: 1,
      },
    },
    "4": {
      class_type: "SaveImage",
      inputs: {
        images: ["3", 0],
        filename_prefix: "faceswap_viralscope",
      },
    },
  };
}

async function queuePrompt(workflow: object): Promise<string> {
  const res = await fetch(`${COMFYUI_URL}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ComfyUI prompt error: ${res.status} - ${text}`);
  }
  const data = await res.json();
  return data.prompt_id;
}

async function waitForResult(promptId: string, timeoutMs = 90000): Promise<string> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 2000));
    const res = await fetch(`${COMFYUI_URL}/history/${promptId}`);
    if (!res.ok) continue;
    const history = await res.json();
    if (history[promptId]) {
      const outputs = history[promptId].outputs;
      for (const nodeId of Object.keys(outputs)) {
        if (outputs[nodeId].images?.length > 0) {
          return outputs[nodeId].images[0].filename;
        }
      }
      // Check if there was an error
      if (history[promptId].status?.status_str === "error") {
        throw new Error("ComfyUI processing error - revisa la consola de ComfyUI");
      }
    }
  }
  throw new Error("Timeout esperando resultado de ComfyUI (90s)");
}

async function getImageAsBase64(filename: string): Promise<string> {
  const res = await fetch(
    `${COMFYUI_URL}/view?filename=${encodeURIComponent(filename)}&type=output`
  );
  if (!res.ok) throw new Error("No se pudo obtener la imagen de ComfyUI");
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:image/png;base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    // Check ComfyUI is running
    try {
      const check = await fetch(`${COMFYUI_URL}/system_stats`, { signal: AbortSignal.timeout(3000) });
      if (!check.ok) throw new Error();
    } catch {
      return NextResponse.json({
        error: "ComfyUI no está corriendo. Ábrelo en tu PC primero."
      }, { status: 503 });
    }

    const body = await req.json();
    const { thumbnailBase64, faceBase64 } = body;

    if (!thumbnailBase64 || !faceBase64) {
      return NextResponse.json({ error: "Faltan imágenes" }, { status: 400 });
    }

    // Upload both images to ComfyUI
    const [thumbName, faceName] = await Promise.all([
      uploadImage(thumbnailBase64, "faceswap_input.png"),
      uploadImage(faceBase64, "faceswap_face.png"),
    ]);

    // Build and queue ReActor workflow
    const workflow = buildReactorWorkflow(thumbName, faceName);
    const promptId = await queuePrompt(workflow);

    const filename  = await waitForResult(promptId);
    const resultB64 = await getImageAsBase64(filename);

    return NextResponse.json({ imageBase64: resultB64, method: "reactor" });

  } catch (err: unknown) {
    console.error("[faceswap] error:", err);
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
