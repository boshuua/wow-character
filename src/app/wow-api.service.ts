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
  private collectionsUrl = `${this.backendUrl}/profile/wow/character`;
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
    const normalizedName = characterName.toLowerCase();
    const normalizedRealm = realm.toLowerCase();

    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': 'Bearer ' + token
        });
        const params = new HttpParams()
          .set('locale', 'en_GB')
          .set('namespace', 'profile-eu')
          .set('region', 'eu');

        const base = `${this.apiUrl}/${normalizedRealm}/${normalizedName}`;

        const requests = {
          profile: this.http.get(`${base}`, { headers, params }),
          media: this.http.get(`${base}/character-media`, { headers, params }).pipe(catchError(() => of(null))),
          equipment: this.http.get(`${base}/equipment`, { headers, params }).pipe(catchError(() => of(null))),
          statistics: this.http.get(`${base}/statistics`, { headers, params }).pipe(catchError(() => of(null))),
          professions: this.http.get(`${base}/professions`, { headers, params }).pipe(catchError(() => of(null))),
          reputations: this.http.get(`${base}/reputations`, { headers, params }).pipe(catchError(() => of(null))),
          titles: this.http.get(`${base}/titles`, { headers, params }).pipe(catchError(() => of(null))),
          specializations: this.http.get(`${base}/specializations`, { headers, params }).pipe(catchError(() => of(null))),
          mounts: this.http.get(`${base}/collections/mounts`, { headers, params }).pipe(catchError(() => of(null))),
          pets: this.http.get(`${base}/collections/pets`, { headers, params }).pipe(catchError(() => of(null))),
          achievements: this.http.get(`${base}/achievements`, { headers, params }).pipe(catchError(() => of(null))),
          mythicKeystone: this.http.get(`${base}/mythic-keystone-profile`, { headers, params }).pipe(catchError(() => of(null))),
          pvpSummary: this.http.get(`${base}/pvp-summary`, { headers, params }).pipe(catchError(() => of(null))),
          raids: this.http.get(`${base}/encounters/raids`, { headers, params }).pipe(catchError(() => of(null)))
        };

        return forkJoin(requests).pipe(
          switchMap((results: any) => {
            const media = results.media;
            let imageUrl = null;

            // Fallback strategy for character image to ensure one is always shown if possible
            if (media && media.assets) {
              const mainAsset = media.assets.find((asset: any) => asset.key === 'main');
              const insetAsset = media.assets.find((asset: any) => asset.key === 'inset');
              const mainRawAsset = media.assets.find((asset: any) => asset.key === 'main-raw');

              if (mainAsset) {
                imageUrl = mainAsset.value;
              } else if (insetAsset) {
                imageUrl = insetAsset.value;
              } else if (mainRawAsset) {
                imageUrl = mainRawAsset.value;
              }
            }
            
            const characterData: any = {
              ...results,
              imageUrl: imageUrl
            };

            // Fetch item media for equipped items
            if (characterData.equipment?.equipped_items?.length > 0) {
              const itemMediaRequests: Observable<string | null>[] = characterData.equipment.equipped_items.map((item: any) =>
                this.getItemMedia(item.media.key.href, token)
              );

              return forkJoin(itemMediaRequests).pipe(
                map((itemIconUrls: (string | null)[]) => {
                  itemIconUrls.forEach((iconUrl: string | null, index: number) => {
                    characterData.equipment.equipped_items[index].iconUrl = iconUrl;
                  });
                  return characterData;
                })
              );
            } else {
              return of(characterData);
            }
          })
        );
      })
    );
  }
}