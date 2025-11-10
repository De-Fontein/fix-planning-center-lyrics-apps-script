class LyricsProcessor {
  constructor() {
    this.lineSeparator = '\n';
    this.defaultSectionHeader = 'GENERAL';
    this.sectionHeaderTranslationDictionary = getSectionHeaderTranslations();
  }

  cleanLyrics(lyrics) {
    let cleanedLyrics = lyrics;

    cleanedLyrics = this.trimLines(cleanedLyrics);
    cleanedLyrics = this.collapseMultipleBlankLines(cleanedLyrics);
    cleanedLyrics = this.replaceParenthesesDashes(cleanedLyrics);
    cleanedLyrics = this.stripHangingDashes(cleanedLyrics);
    cleanedLyrics = this.detectSectionHeaders(cleanedLyrics);

    let sections = this.parseSections(cleanedLyrics);
    sections = this.consolidateSections(sections);

    cleanedLyrics = this.convertSectionsToLyrics(sections);

    Logger.log(`Cleaned Lyrics:\n${cleanedLyrics}`);

    return cleanedLyrics;
  }

  trimLines(lyrics) {
    return lyrics.split(this.lineSeparator).map(line => line.trim()).join(this.lineSeparator);
  }

  collapseMultipleBlankLines(lyrics) {
    const doubleNewline = this.lineSeparator + this.lineSeparator;
    return lyrics.replace(/(\n\s*){2,}/g, doubleNewline);
  }

  replaceParenthesesDashes(lyrics) {
    return lyrics.replace(/\)\s*-/g, ') .');
  }

  // replace dashes that start and end with whitespace
  stripHangingDashes(lyrics) {
    return lyrics.replace(/\s-\s/g, '');
  }

  detectSectionHeaders(lyrics) {
    const lines = lyrics.split(this.lineSeparator);
    const processedLines = lines.map(line => this.detectSectionHeader(line));
    return processedLines.join(this.lineSeparator);
  }

  detectSectionHeader(line) {
    const parts = line.split(/\s+/);
    if (parts.length > 2) {
      return line;
    }

    const potentialHeader = parts[0].toLowerCase();

    const foundHeader = this.sectionHeaderTranslationDictionary[potentialHeader];
    if (foundHeader) {
      return foundHeader;
    }

    return line;
  }

  parseSections(lyrics) {
    const lines = lyrics.split(this.lineSeparator);
    const sections = [];
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const detectedHeader = this.detectSectionHeader(line);

      const isHeader = this.sectionHeaderTranslationDictionary[detectedHeader.toLowerCase()] === detectedHeader;
      if (isHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          header: detectedHeader,
          lyrics: []
        };
      } else if (currentSection) {
        currentSection.lyrics.push(line);
      } else if (line.trim()) {
        currentSection = {
          header: this.defaultSectionHeader,
          lyrics: [line]
        };
      }
    }

    // Don't forget to add the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.map(section => ({
      header: section.header,
      lyrics: section.lyrics.join(this.lineSeparator)
    }));
  }

 consolidateSections(sections) {
    const seenLyricsByHeader = {};
    const headerOccurrences = {};
    const result = [];
    
    // First pass: remove duplicates and count occurrences
    for (const section of sections) {
      const header = section.header;
      
      if (!seenLyricsByHeader[header]) {
        seenLyricsByHeader[header] = new Set();
        headerOccurrences[header] = [];
      }
      
      if (!seenLyricsByHeader[header].has(section.lyrics)) {
        seenLyricsByHeader[header].add(section.lyrics);
        headerOccurrences[header].push(result.length);
        result.push(section);
      }
    }
    
    // Second pass: add numbers only where needed
    for (const header in headerOccurrences) {
      const positions = headerOccurrences[header];
      if (positions.length > 1) {
        positions.forEach((pos, index) => {
          result[pos] = {
            header: `${header} ${index + 1}`,
            lyrics: result[pos].lyrics
          };
        });
      }
    }

    return result;
  }

  convertSectionsToLyrics(sections) {
    return sections.map(section => {
      return `${section.header}${this.lineSeparator}${section.lyrics}`;
    }).join(this.lineSeparator);
  }
}
