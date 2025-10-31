import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators'; // Added catchError

@Injectable({
  providedIn: 'root'
})
export class WowApiService {

  private region = 'eu';
  private backendUrl = 'http://localhost:3000/api/wow'; // Base URL for the backend proxy
  private apiUrl = `${this.backendUrl}/profile/wow/character`;
  private characterMediaUrl = `${this.backendUrl}/profile/wow/character`;
  private itemMediaBaseUrl = `${this.backendUrl}/data/wow/media/item`; // Base URL for item media

  constructor(private http: HttpClient) { }

  private getAccessToken(): Observable<string> {
    return this.http.get<any>(`${this.backendUrl}/token`).pipe(
      map(response => response.access_token)
    );
  }

  // Helper to fetch item media
  private getItemMedia(itemKeyHref: string, token: string): Observable<string | null> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    // The itemKeyHref already contains the full path to the item media endpoint
    // We need to replace the base Battle.net API URL with our backend proxy URL
    const proxiedItemMediaUrl = itemKeyHref.replace('https://eu.api.blizzard.com/data/wow/media/item', this.itemMediaBaseUrl);

    return this.http.get<any>(proxiedItemMediaUrl, { headers: headers }).pipe(
      map(mediaResponse => {
        const iconAsset = mediaResponse.assets.find((asset: any) => asset.key === 'icon');
        return iconAsset ? iconAsset.value : null;
      }),
      catchError(error => {
        console.error('Error fetching item media:', error);
        return of(null); // Return null on error to allow other items to load
      })
    );
  }

  getCharacterData(characterName: string, realm: string): Observable<any> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': 'Bearer ' + token
        });
        const params = new HttpParams()
          .set('locale', 'en_GB')
          .set('namespace', 'profile-eu')
          .set('region', 'eu');

        const characterProfileRequest = this.http.get(`${this.apiUrl}/${realm}/${characterName.toLowerCase()}`, { headers: headers, params: params });
        const characterMediaRequest = this.http.get(`${this.characterMediaUrl}/${realm}/${characterName.toLowerCase()}/character-media`, { headers: headers, params: params });
        const characterEquipmentRequest = this.http.get(`${this.apiUrl}/${realm}/${characterName.toLowerCase()}/equipment`, { headers: headers, params: params });
        const characterStatisticsRequest = this.http.get(`${this.apiUrl}/${realm}/${characterName.toLowerCase()}/statistics`, { headers: headers, params: params });
        const characterProfessionsRequest = this.http.get(`${this.apiUrl}/${realm}/${characterName.toLowerCase()}/professions`, { headers: headers, params: params });
        const characterReputationsRequest = this.http.get(`${this.apiUrl}/${realm}/${characterName.toLowerCase()}/reputations`, { headers: headers, params: params });
        const characterTitlesRequest = this.http.get(`${this.apiUrl}/${realm}/${characterName.toLowerCase()}/titles`, { headers: headers, params: params });


        return forkJoin([
          characterProfileRequest,
          characterMediaRequest,
          characterEquipmentRequest,
          characterStatisticsRequest,
          characterProfessionsRequest,
          characterReputationsRequest,
          characterTitlesRequest
        ]).pipe(
          switchMap(([profile, media, equipment, statistics, professions, reputations, titles]) => {
            const mainImage = (media as any).assets.find((asset: any) => asset.key === 'main-raw');
            const characterData: any = { // Explicitly type characterData as any
              profile: profile,
              imageUrl: mainImage ? mainImage.value : null,
              equipment: equipment,
              statistics: statistics,
              professions: professions,
              reputations: reputations,
              titles: titles
            };

            // Fetch item media for equipped items
            if ((characterData.equipment as any)?.equipped_items && (characterData.equipment as any).equipped_items.length > 0) { // Cast to any
              const itemMediaRequests: Observable<string | null>[] = (characterData.equipment as any).equipped_items.map((item: any) => // Cast to any
                this.getItemMedia(item.media.key.href, token)
              );

              return forkJoin(itemMediaRequests).pipe(
                map((itemIconUrls: (string | null)[]) => { // Explicitly type itemIconUrls
                  itemIconUrls.forEach((iconUrl: string | null, index: number) => { // Explicitly type iconUrl and index
                    (characterData.equipment as any).equipped_items[index].iconUrl = iconUrl; // Cast to any
                  });
                  return characterData;
                })
              );
            } else {
              return of(characterData); // No equipped items, return characterData as is
            }
          })
        );
      })
    );
  }
}