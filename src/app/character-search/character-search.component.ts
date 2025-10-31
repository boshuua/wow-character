import { Component } from '@angular/core';
import { WowApiService } from '../wow-api.service';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from '../search-form/search-form.component';

@Component({
  selector: 'app-character-search',
  standalone: true,
  imports: [CommonModule, SearchFormComponent],
  templateUrl: './character-search.component.html',
  styleUrl: './character-search.component.css'
})
export class CharacterSearchComponent {
  characterData: any; // Holds all fetched data
  character: any;
  characterImageUrl: string | null = null;
  equipment: any;
  statistics: any;
  professions: any;
  reputations: any;
  titles: any;
  error: any;

  constructor(private wowApiService: WowApiService) { }

  onSearch(searchData: { characterName: string, realm: string }) {
    this.characterData = null;
    this.character = null;
    this.characterImageUrl = null;
    this.equipment = null;
    this.statistics = null;
    this.professions = null;
    this.reputations = null;
    this.titles = null;
    this.error = null;

    this.wowApiService.getCharacterData(searchData.characterName, searchData.realm)
      .subscribe(
        (data) => {
          this.characterData = data;
          this.character = data.profile;
          this.characterImageUrl = data.imageUrl;
          this.equipment = data.equipment;
          this.statistics = data.statistics;
          this.professions = data.professions;
          this.reputations = data.reputations;
          this.titles = data.titles;
          this.error = null;
          console.log('Character Data:', data); // Add this line
        },
        (error) => {
          this.error = error;
          this.characterData = null;
          this.character = null;
          this.characterImageUrl = null;
          this.equipment = null;
          this.statistics = null;
          this.professions = null;
          this.reputations = null;
          this.titles = null;
        }
      );
  }

  getEquippedItem(slotType: string): any | undefined {
    if (this.equipment && this.equipment.equipped_items) {
      return this.equipment.equipped_items.find((item: any) => item.slot.type === slotType);
    }
    return undefined;
  }

  getPrimaryCrit(): number | null {
    if (!this.statistics) return null;
    if (this.statistics.melee_crit?.value > 0) return this.statistics.melee_crit.value;
    if (this.statistics.spell_crit?.value > 0) return this.statistics.spell_crit.value;
    if (this.statistics.ranged_crit?.value > 0) return this.statistics.ranged_crit.value;
    return null;
  }

  getPrimaryHaste(): number | null {
    if (!this.statistics) return null;
    if (this.statistics.melee_haste?.value > 0) return this.statistics.melee_haste.value;
    if (this.statistics.spell_haste?.value > 0) return this.statistics.spell_haste.value;
    if (this.statistics.ranged_haste?.value > 0) return this.statistics.ranged_haste.value;
    return null;
  }
}
