// TODO: Decide whether we want to use chord_chart instead of lyrics in the future.
class PlanningCenterAPI {
  constructor(clientId, clientSecret) {
    this.baseUrl = 'https://api.planningcenteronline.com/services/v2';
    this.authHeader = this.getBasicAuthHeader(clientId, clientSecret);
  }

  getBasicAuthHeader(appId, secret) {
    return 'Basic ' + Utilities.base64Encode(`${appId}:${secret}`);
  }

  getAllSongs() {
    const limit = 25;
    let offset = 0;
    let songs = [];
    let hasNext = true;

    while (hasNext) {
      const data = this.getSongsPage(offset, limit);
      const songsToAdd = Array.isArray(data.data) ? data.data : [];
      songs = [...songs, ...songsToAdd];

      // To avoid hitting rate limits
      Utilities.sleep(500);

      if (data.links?.next) {
        offset += limit;
      } else {
        hasNext = false;
      }
    }

    return songs;
  }

  getSongsPage(offset = 0, limit = 25) {
    const url = `${this.baseUrl}/songs?offset=${offset}&per_page=${limit}`;
    const response = UrlFetchApp.fetch(url, {
      headers: { Authorization: this.authHeader },
    });
    const data = JSON.parse(response.getContentText());
    return data || { data: [] };
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
