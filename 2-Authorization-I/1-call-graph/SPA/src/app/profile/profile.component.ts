import { Component, OnInit } from '@angular/core';
import { InteractionType } from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { ResponseType } from '@microsoft/microsoft-graph-client';

import { GraphService, ProviderOptions } from '../graph.service';
import { protectedResources } from '../auth-config';
import { Profile } from '../profile';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profile!: Profile;
  displayedColumns: string[] = ['claim', 'value'];
  dataSource: any = [];
  avatar: any;
  image: any;

  constructor(
    private graphService: GraphService,
    private authService: MsalService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const providerOptions: ProviderOptions = {
      account: this.authService.instance.getActiveAccount()!,
      scopes: protectedResources.graphMe.scopes,
      interactionType: InteractionType.Redirect,
      endpoint: protectedResources.graphMe.endpoint,
    };

    this.getAvatar(providerOptions);
  }

  transform(html: any) {
    return this.sanitizer.bypassSecurityTrustUrl(html);
  }

  getAvatar(providerOptions: ProviderOptions) {
    this.graphService
      .getGraphClient(providerOptions)
      .api('/me/photo//$value')
      .responseType(ResponseType.RAW)
      .get()
      .then((response: any) => {
        if (response.status === 200) {
          response.blob().then((data: any) => {
            if (data !== null) {
              window.URL = window.URL || window.webkitURL;
              console.log('data', data);
              var objectUrl = window.URL.createObjectURL(data);
              console.log('image', this.image);
              this.image = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
            }
          });
        }
        if (response.status === 401) {
          if (response.headers.get('WWW-Authenticate')) {
            this.graphService.handleClaimsChallenge(response, providerOptions);
          }
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  }
}
