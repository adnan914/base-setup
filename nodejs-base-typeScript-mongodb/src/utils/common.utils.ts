import { SignOptions, sign } from "jsonwebtoken";
import axios from "axios";
import fs from "fs";
import path from "path";
import { AppError } from "./app.error";
import { MessageUtil } from "./messages.utils";
import { StatusUtil } from "./status.utils";



export class CommonUtils {
  static generateToken(data: any, secret: string, options: SignOptions): string {
    return sign(data, secret, { expiresIn: options.expiresIn });
  }

  static generateRandomText(): string {
    const samples = [
      "Hello, this is a sample transcription.",
      "The quick brown fox jumps over the lazy dog.",
      "VoiceOwl test transcription data.",
      "Randomly generated text for audio file.",
      "This is a mocked transcription response."
    ];

    return samples[Math.floor(Math.random() * samples.length)];
  }

  static async downloadWithRetry(url: string, retries: number = 1): Promise<string> {
    let filePath: string;
    if (process.env.NODE_ENV === 'development') {
      console.log(path.join(__dirname, "../../public/audio"));
      filePath = path.join(__dirname, "../../public/audio", `${Date.now()}.mp3`);
    } else {
      filePath = path.join(__dirname, "../public/audio", `${Date.now()}.mp3`);
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, { responseType: "stream" });

        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", () => {
            resolve(true)
          });
          writer.on("error", reject);
        });
        return filePath;
      } catch (error) {
        if (attempt === retries) throw new AppError(MessageUtil.DOWNLOAD_AUDIO_FAIELD, StatusUtil.EXTERNAL_SERVICE_FAIL);
      }
    }
    throw new AppError(MessageUtil.DOWNLOAD_AUDIO_FAIELD, StatusUtil.EXTERNAL_SERVICE_FAIL);
  }

}
