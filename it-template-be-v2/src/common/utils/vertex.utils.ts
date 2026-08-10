import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';
import { VertexAI } from '@google-cloud/vertexai';
import * as https from 'https';

export async function scrapePageText(url: string, httpService: HttpService): Promise<string> {
  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    const response$ = httpService.get(url, {
      httpsAgent,
    });
    const response = await lastValueFrom(response$);
    const html = response.data;

    const $ = cheerio.load(html);
    // Ambil teks utama halaman, bisa dimodifikasi sesuai struktur halaman
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    return bodyText;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Gagal ambil meta description:', error.message);
    } else {
      console.error('Gagal ambil meta description:', error);
    }
    return 'Gagal mengambil konten.';
  }
}

// Contoh panggil Vertex AI (pseudocode)
export async function explainUrlWithVertexAI(
  promptSearch: string,
  url: string,
  httpService: HttpService
) {
  const pageText = await scrapePageText(url, httpService);

  //   const prompt = `Jelaskan apa kegunaan website berikut dalam 1 paragraf halaman dengan detail:\n\n${pageText}`;
  const prompt = `${promptSearch}:\n\n${pageText}`;

  // Setup project and location
  const vertexAI = new VertexAI({
    project: process.env.VERTEX_AI_PROJECT,
    location: process.env.VERTEX_AI_LOCATION,
  });

  // Load generative model
  const model = vertexAI.getGenerativeModel({
    model: process.env.VERTEX_AI_MODEL, // bisa juga 'text-bison'
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const vertexResponse = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return vertexResponse;
}
