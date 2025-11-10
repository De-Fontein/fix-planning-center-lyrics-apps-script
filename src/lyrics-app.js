class LyricsApp {
  constructor() {
    const properties = PropertiesService.getScriptProperties();
    const clientId = properties.getProperty('PLANNING_CENTER_CLIENT_ID');
    const clientSecret = properties.getProperty('PLANNING_CENTER_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      Logger.log('❌ Missing Planning Center App ID or Secret. Set PLANNING_CENTER_CLIENT_ID and PLANNING_CENTER_CLIENT_SECRET in Script Properties.');
      return;
    }
    
    this.api = new PlanningCenterAPI(clientId, clientSecret);
    this.processor = new LyricsProcessor();
    // Throttle between API requests (override via Script Property: REQUEST_DELAY_MS)
    this.requestDelayMs = Number(properties.getProperty('REQUEST_DELAY_MS')) || 500;
  }

  run() {
    // TODO: Convert songs back to a constant after testing
    const songs = this.api.getAllSongs();
    Logger.log(`🎵 Found ${songs.length} songs to check.`);

    songs.forEach(song => {
      try {
        this.fixSongLyrics(song);
      } catch (err) {
        Logger.log(`⚠️ Error fixing "${song.attributes.title}": ${err.message}`);
      }
    });

    Logger.log('✅ Finished lyric cleanup run.');
  }

  fixSongLyrics(song) {
    const songId = song.id;
    const title = song.attributes.title;

    const arrangements = this.api.getArrangements(songId);
    arrangements.forEach(arr => {
      const arrId = arr.id;
      // Throttle before fetching to avoid rate limits
      Utilities.sleep(this.requestDelayMs);
      const lyrics = this.api.getChordChart(songId, arrId);
      const cleaned = this.processor.cleanLyrics(lyrics);

      if (lyrics !== cleaned) {
        // Throttle before update as well
        Utilities.sleep(this.requestDelayMs);
        // TODO: Enable once verified
        // this.api.updateChordChart(songId, arrId, cleaned);
        Logger.log(`✅ Updated lyrics for "${title}" (Arrangement: ${arr.attributes.name})`);
      } else {
        Logger.log(`👌 No changes for "${title}" (Arrangement: ${arr.attributes.name})`);
      }
    });
  }
}
