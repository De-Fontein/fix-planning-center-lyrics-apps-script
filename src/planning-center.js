// TODO: Decide whether we want to use chord_chart instead of lyrics in the future.
class PlanningCenterAPI {
  constructor(clientId, clientSecret) {
    this.baseUrl = 'https://api.planningcenteronline.com/services/v2';
    this.authHeader = this.getBasicAuthHeader(clientId, clientSecret);
  }

  getBasicAuthHeader(appId, secret) {
    return 'Basic ' + Utilities.base64Encode(`${appId}:${secret}`);
  }

  getSongs() {
    const response = UrlFetchApp.fetch(`${this.baseUrl}/songs`, {
      headers: { Authorization: this.authHeader },
    });
    const data = JSON.parse(response.getContentText());
    return data.data || [];
  }

  getArrangements(songId) {
    const response = UrlFetchApp.fetch(`${this.baseUrl}/songs/${songId}/arrangements`, {
      headers: { Authorization: this.authHeader },
    });
    return JSON.parse(response.getContentText()).data || [];
  }

  getLyrics(songId, arrangementId) {
    const url = `${this.baseUrl}/songs/${songId}/arrangements/${arrangementId}`;
    const response = UrlFetchApp.fetch(url, {
      headers: { Authorization: this.authHeader },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() === 404) {
      Logger.log(`🔍 Arrangement ${arrangementId} not found. Skipping.`);
      return '';
    }

    const data = JSON.parse(response.getContentText());
    return data.data?.attributes?.lyrics || '';
  }

  updateLyrics(songId, arrangementId, newLyrics) {
    const url = `${this.baseUrl}/songs/${songId}/arrangements/${arrangementId}`;
    const payload = JSON.stringify({
      data: {
        type: 'Arrangement',
        id: arrangementId,
        attributes: {
          lyrics: newLyrics
        }
      }
    });

    UrlFetchApp.fetch(url, {
      method: 'patch',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json'
      },
      payload
    });
  }
}
