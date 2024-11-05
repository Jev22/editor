import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-editor-handler',
  standalone: true,
  imports: [CommonModule, EditorComponent],
  templateUrl: './editor-handler.component.html',
  styleUrls: ['./editor-handler.component.scss'],
})
export class EditorHandlerComponent {
  tinyApi: string = 'Redacted';

  imageMaxWidth: number = 800;
  imageMaxHeigth: number = 800;

  init: EditorComponent['init'] = {
    selector: 'textarea',
    plugins: 'lists link image table code help wordcount powerpaste',
    paste_preprocess: async (plugin: any, args: any) => {
      let content = args.content;

      console.log('--- Start paste_preprocess ---');
      console.log('Original content:', content);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      const images = Array.from(
        tempDiv.querySelectorAll('img')
      ) as HTMLImageElement[];
      console.log('Found images:', images.length);

      const blobPromises = images.map(async (img) => {
        const needsResize =
          img.width > this.imageMaxWidth || img.height > this.imageMaxHeigth;

        // Log initial størrelse og om billedet skal resizes
        console.log('Initial image check:', {
          width: img.width,
          height: img.height,
          needsResize,
          maxWidth: this.imageMaxWidth,
          maxHeight: this.imageMaxHeigth,
          fileSize: 'NA for initial HTML img',
        });

        if (needsResize && img.src.startsWith('blob:')) {
          try {
            const response = await fetch(img.src);
            const blob = await response.blob();
            return {
              img,
              blob,
              originalSrc: img.src,
            };
          } catch (error) {
            console.error('Error fetching blob:', error);
            return null;
          }
        }
        return null;
      });

      const blobResults = await Promise.all(blobPromises);

      const resizeCount = blobResults.filter(
        (result) => result !== null
      ).length;
      console.log(`Number of images for resizing: ${resizeCount}`);

      for (const result of blobResults) {
        if (result) {
          try {
            const { img, blob, originalSrc } = result;

            console.log('Starting process of image:', {
              originalWidth: img.width,
              originalHeight: img.height,
              originalSize: `${(blob.size / 1024).toFixed(2)} KB`,
            });

            const fileDataUrl = await this.readFile(blob);
            const loadedImage = await this.loadImage(fileDataUrl);
            const resizedBase64 = await this.resizeImage(loadedImage);

            // Calculating the size of the resized base64 image
            const resizedSizeInBytes = Math.ceil(
              (resizedBase64.length * 3) / 4
            );
            const resizedImg = await this.loadImage(resizedBase64);

            console.log('Image process completed:', {
              originalWidth: img.width,
              originalHeight: img.height,
              originalSize: `${(blob.size / 1024).toFixed(2)} KB`,
              newWidth: resizedImg.width,
              newHeight: resizedImg.height,
              newSize: `${(resizedSizeInBytes / 1024).toFixed(2)} KB`,
              kompression: `${(
                (1 - resizedSizeInBytes / blob.size) *
                100
              ).toFixed(1)}%`,
            });

            img.src = resizedBase64;
          } catch (error) {
            console.error('Error: ', error);
          }
        }
      }

      content = tempDiv.innerHTML;
      console.log('--- End of paste_preprocess ---');
      args.content = content;
    },
  };

  // Function to read the file as a base64 string
  readFile(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject('File reading failed.');
      };

      reader.readAsDataURL(blob);
    });
  }

  // Function to load the base64 string as an image
  loadImage(base64Image: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject('Image loading failed.');
      };

      image.src = base64Image;
    });
  }

  // Function to resize the image using a canvas and return the resized base64 string
  resizeImage(image: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
      let width = image.width;
      let height = image.height;

      // Maintain aspect ratio and resize if necessary
      if (width > this.imageMaxWidth || height > this.imageMaxHeigth) {
        const aspectRatio = width / height;
        if (width > height) {
          width = this.imageMaxWidth;
          height = this.imageMaxWidth / aspectRatio;
        } else {
          height = this.imageMaxHeigth;
          width = this.imageMaxHeigth * aspectRatio;
        }
      }

      // Create canvas and draw the resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(image, 0, 0, width, height);
        const base64data = canvas.toDataURL('image/jpeg'); // You can change to 'image/png'
        resolve(base64data);
      } else {
        reject('Canvas context not available.');
      }
    });
  }
}
