import { Component } from '@angular/core';
import { CharacterSearchComponent } from './character-search/character-search.component';

@Component({
  selector: 'app-root',
  imports: [CharacterSearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WowCharFinder';
}
