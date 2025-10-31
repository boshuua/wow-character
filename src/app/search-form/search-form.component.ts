import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent {
  characterName: string = '';
  realm: string = '';
  realmSearchText: string = '';
  showRealmDropdown: boolean = false;

  @Output() searchEvent = new EventEmitter<{ characterName: string, realm: string }>();

  // EU Realm list - normalized for API (lowercase, hyphens instead of spaces)
  euRealms: string[] = [
    'aegwynn', 'aerie-peak', 'agamaggan', 'aggra-português', 'aggramar', 'ahnqiraj',
    'alakir', 'alexstrasza', 'alleria', 'alonsus', 'aman-thul', 'ambossar', 'anachronos',
    'anetheron', 'antonidas', 'anub-arak', 'arak-arahm', 'arathi', 'arathor', 'archimonde',
    'area-52', 'argent-dawn', 'arthas', 'arygos', 'ashenvale', 'aszune', 'auchindoun',
    'azjol-nerub', 'azshara', 'azuregos', 'azuremyst', 'baelgun', 'balnazzar', 'blackhand',
    'blackmoore', 'blackrock', 'black-scar', 'blade-s-edge', 'bladefist', 'bloodfang',
    'bloodhoof', 'bloodscalp', 'blutkessel', 'booty-bay', 'boulderfist', 'bronze-dragonflight',
    'bronzebeard', 'burning-blade', 'burning-legion', 'burning-steppes', 'chamber-of-aspects',
    'chromaggus', 'colinas-pardas', 'confrérie-du-thorium', 'conseil-des-ombres', 'crushridge',
    'culte-de-la-rive-noire', 'daggerspine', 'dalaran', 'dalvengyr', 'darkmoon-faire',
    'darksorrow', 'darkspear', 'das-konsortium', 'das-syndikat', 'deathguard', 'deathweaver',
    'deathwing', 'deepholm', 'defias-brotherhood', 'dentarg', 'der-abyssische-rat',
    'der-mithrilorden', 'der-rat-von-dalaran', 'dethecus', 'die-aldor', 'die-arguswacht',
    'die-ewige-wacht', 'die-nachtwache', 'die-silberne-hand', 'die-todeskrallen', 'doomhammer',
    'draenor', 'dragonblight', 'dragonmaw', 'drak-thul', 'drek-thar', 'dun-modr', 'dun-morogh',
    'dunemaul', 'earthen-ring', 'echsenkessel', 'eitrigg', 'eldre-thalas', 'elune', 'emerald-dream',
    'emeriss', 'eonar', 'eredar', 'executus', 'exodar', 'festung-der-stürme', 'forscherliga',
    'frostmane', 'frostmourne', 'frostwhisper', 'frostwolf', 'garona', 'garrosh', 'genjuros',
    'ghostlands', 'gilneas', 'goldrinn', 'gordunni', 'gorgonnash', 'greymane', 'grim-batol',
    'gul-dan', 'hakkar', 'haomarush', 'hellfire', 'hellscream', 'howling-fjord', 'hyjal',
    'illidan', 'jaedenar', 'kael-thas', 'karazhan', 'kargath', 'kazzak', 'kel-thuzad',
    'khadgar', 'khaz-goroth', 'khaz-modan', 'kil-jaeden', 'kilrogg', 'kirin-tor', 'kor-gall',
    'krag-jin', 'krasus', 'kul-tiras', 'kult-der-verdammten', 'la-croisade-écarlate', 'laughing-skull',
    'les-clairvoyants', 'les-sentinelles', 'lich-king', 'lightbringer', 'lightning-s-blade',
    'lights-hope', 'lordaeron', 'los-errantes', 'lothar', 'madmortem', 'magtheridon', 'mal-ganis',
    'malfurion', 'malorne', 'malygos', 'mannoroth', 'marécage-de-zangar', 'mazrigos', 'medivh',
    'minahonda', 'moonglade', 'mug-thol', 'nagrand', 'nathrezim', 'naxxramas', 'nefarian',
    'nemesis', 'neptulon', 'ner-zhul', 'nethersturm', 'nordrassil', 'norgannon', 'nozdormu',
    'onyxia', 'outland', 'perenolde', 'pozzo-dell-eternità', 'proudmoore', 'quel-thalas',
    'ragnaros', 'rajaxx', 'rashgarroth', 'ravencrest', 'ravenholdt', 'razuvious', 'rexxar',
    'runetotem', 'saurfang', 'scarshield-legion', 'sanguino', 'sargeras', 'scarlet-crusade',
    'sen-jin', 'sentinels', 'shadowsong', 'shattered-halls', 'shattered-hand', 'shattrath',
    'shen-dralar', 'silvermoon', 'sinstralis', 'skullcrusher', 'soggy-suncatcher', 'stormrage',
    'stormreaver', 'stormscale', 'sunstrider', 'suramar', 'sylvanas', 'tarren-mill', 'taerar',
    'talnivarr', 'tarren-mill', 'temple-noir', 'terenas', 'terokkar', 'terrordar', 'the-maelstrom',
    'the-sha-tar', 'the-venture-co', 'theradras', 'thermaplugg', 'thrall', 'thunderhorn',
    'tichondrius', 'tirion', 'todeswache', 'tomb-of-sargeras', 'trollbane', 'turalyon',
    'twilight-s-hammer', 'twisting-nether', 'tyrannos', 'uldaman', 'ulduar', 'uldum',
    'un-goro', 'undermine', 'ungerbogen', 'vashj', 'varimathras', 'vek-lor', 'vek-nilash',
    'veknilash', 'vol-jin', 'wildhammer', 'wrathbringer', 'xavius', 'ysera', 'ysondre',
    'zangarmarsh', 'zenedar', 'zirkel-des-cenarius', 'zul-jin', 'zuluhed'
  ];

  filteredRealms: string[] = [];

  constructor() {
    this.filteredRealms = this.euRealms;
  }

  searchCharacter() {
    if (this.characterName && this.realm) {
      this.searchEvent.emit({ characterName: this.characterName, realm: this.realm });
    }
  }

  onRealmSearchChange() {
    const search = this.realmSearchText.toLowerCase();
    if (search === '') {
      this.filteredRealms = this.euRealms;
    } else {
      this.filteredRealms = this.euRealms.filter(realm =>
        realm.toLowerCase().includes(search)
      );
    }
    this.showRealmDropdown = true;
  }

  selectRealm(realm: string) {
    this.realm = realm;
    this.realmSearchText = this.formatRealmDisplay(realm);
    this.showRealmDropdown = false;
  }

  formatRealmDisplay(realm: string): string {
    // Convert "argent-dawn" to "Argent Dawn" for display
    return realm.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  onRealmInputFocus() {
    this.showRealmDropdown = true;
    this.filteredRealms = this.euRealms;
  }

  onRealmInputBlur() {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      this.showRealmDropdown = false;
    }, 200);
  }
}