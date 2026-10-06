// recorta y achica una foto al tamaño que le pido, asi no importa que tamaño suban
// la estira hasta tapar todo y lo que sobra de los costados o arriba queda afuera, centrada
// devuelve la foto nueva lista para subir, en jpg
export async function ajustarImagen(archivo: File, ancho: number, alto: number): Promise<Blob> {
  const img = await leerImagen(archivo);

  
  // un lienzo del tamaño final
  const canvas = document.createElement('canvas');
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext('2d')!;

  // cuanto la agrando o achico para que tape todo el lienzo
  const escala = Math.max(ancho / img.width, alto / img.height);
  const w = img.width * escala;
  const h = img.height * escala;

  // la dibujo centrada
  ctx.drawImage(img, (ancho - w) / 2, (alto - h) / 2, w, h);

  // paso el lienzo a jpg
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => {
      if (b) resolve(b);
      else reject(new Error('No se pudo ajustar la imagen'));
    }, 'image/jpeg', 0.85);
  });
}

// carga el archivo elegido como imagen para poder dibujarla
function leerImagen(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('El archivo no es una imagen'));
    img.src = URL.createObjectURL(archivo);
  });
}