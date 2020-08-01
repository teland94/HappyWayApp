import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  private icons = [{
      iconName: 'copy',
      url: '../assets/icons/copy.svg'
    }, {
      iconName: 'viber',
      url: '../assets/icons/viber.svg'
    }, {
      iconName: 'man',
      url: '../assets/icons/man-shape.svg'
    }, {
      iconName: 'woman',
      url: '../assets/icons/woman-silhouette.svg'
    },
  ];

  constructor(private readonly matIconRegistry: MatIconRegistry,
              private readonly domSanitizer: DomSanitizer) {
    for (const icon of this.icons) {
      this.matIconRegistry.addSvgIcon(
        icon.iconName,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.url)
      );
    }
  }
}
