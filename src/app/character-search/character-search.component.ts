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
  specializations: any;
  mounts: any;
  pets: any;
  achievements: any;
  mythicKeystone: any;
  pvpSummary: any;
  raids: any;
  error: any;

  // List of stats to display in the table
  displayStats = [
    { key: 'strength', label: 'Strength' },
    { key: 'agility', label: 'Agility' },
    { key: 'intellect', label: 'Intellect' },
    { key: 'stamina', label: 'Stamina' },
    { key: 'armor', label: 'Armor' },
    { key: 'mastery', label: 'Mastery', isPercent: true },
    { key: 'versatility', label: 'Versatility', isPercent: true },
    { key: 'melee_crit', label: 'Crit', isPercent: true },
    { key: 'melee_haste', label: 'Haste', isPercent: true },
    { key: 'attack_power', label: 'AP' }
  ];

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
    this.specializations = null;
    this.mounts = null;
    this.pets = null;
    this.achievements = null;
    this.mythicKeystone = null;
    this.pvpSummary = null;
    this.raids = null;
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
          this.specializations = data.specializations;
          this.mounts = data.mounts;
          this.pets = data.pets;
          this.achievements = data.achievements;
          this.mythicKeystone = data.mythicKeystone;
          this.pvpSummary = data.pvpSummary;
          this.raids = data.raids;
          this.error = null;
        },
        (error) => {
          this.error = error;
        }
      );
  }

  getActiveSpec(): any {
    return this.specializations?.active_specialization;
  }

  getBestMythicRun(): any {
    if (!this.mythicKeystone?.seasons || this.mythicKeystone.seasons.length === 0) return null;
    // This is a simplified version, ideally you'd fetch the latest season's best runs
    return this.mythicKeystone.seasons[0]; 
  }

  getRaidProgression(): any[] {
    if (!this.raids?.expansions) return [];
    // Return latest expansions for progression
    return this.raids.expansions.slice(-2).reverse();
  }

  getItemStat(item: any, statKey: string): string {
    if (!item.stats || item.stats.length === 0) return '-';
    
    // Normalize stat key for comparison (e.g., 'melee_crit' -> 'crit')
    const normalizedKey = statKey.toLowerCase().replace('melee_', '').replace('spell_', '').replace('ranged_', '');
    
    const foundStat = item.stats.find((s: any) => {
      const type = s.type.name.toLowerCase();
      return type.includes(normalizedKey) || (normalizedKey === 'ap' && type.includes('attack power'));
    });

    if (!foundStat) return '-';
    
    const value = foundStat.value;
    // If it's a primary stat or armor, just show the number
    if (['strength', 'agility', 'intellect', 'stamina', 'armor'].includes(normalizedKey)) {
      return value.toString();
    }
    
    // For combat ratings (crit, haste, etc.), we'd ideally show the percentage contribution 
    // but the API usually gives raw rating points. We'll just show the raw value for now.
    return value.toString();
  }

  getTotalItemStat(statKey: string): string {
    if (!this.equipment?.equipped_items) return '0';
    
    let total = 0;
    this.equipment.equipped_items.forEach((item: any) => {
      const valStr = this.getItemStat(item, statKey);
      if (valStr !== '-') {
        total += parseFloat(valStr);
      }
    });

    const statConfig = this.displayStats.find(s => s.key === statKey);
    if (statConfig?.isPercent) {
      // If it's a percent stat, we show the total with 2 decimals
      return total.toFixed(2) + '%';
    }
    
    return total.toString();
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
