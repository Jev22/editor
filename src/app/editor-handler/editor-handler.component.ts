import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-editor-handler',
  standalone: true,
  imports: [CommonModule, EditorComponent],
  templateUrl: './editor-handler.component.html',
  styleUrls: ['./editor-handler.component.scss']
})
export class EditorHandlerComponent {
    tinyApi: string = "Redacted"
    init: EditorComponent['init'] = {
      plugins: 'lists link image table code help wordcount'
    };

    
}
