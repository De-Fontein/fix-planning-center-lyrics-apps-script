function getSectionHeaderTranslations() {
    const standardSections = getStandardSectionTranslations();
    const alternativeSpellings = getAlternativeSpellingTranslations();
    const dutchTranslations = getDutchSectionTranslations();

    return {
        ...standardSections,
        ...alternativeSpellings,
        ...dutchTranslations
    };
}

function getStandardSectionTranslations() {
    return {
        'verse': 'VERSE',
        'chorus': 'CHORUS',
        'bridge': 'BRIDGE',
        'intro': 'INTRO',
        'outro': 'OUTRO',
        'ending': 'ENDING',
        'instrumental': 'INSTRUMENTAL',
        'interlude': 'INTERLUDE',
        'tag': 'TAG',
        'turnaround': 'TURNAROUND',
        'vamp': 'VAMP',
        'refrain': 'REFRAIN',
        'prechorus': 'PRECHORUS',
        'post-chorus': 'POST-CHORUS',
        'breakdown': 'BREAKDOWN',
        'coda': 'CODA',
    };
}

function getAlternativeSpellingTranslations() {
    return {
        'pre-chorus': 'PRECHORUS',
        'pre chorus': 'PRECHORUS',
        'postchorus': 'POST-CHORUS',
        'post chorus': 'POST-CHORUS',
    };
}


function getDutchSectionTranslations() {
    return {
        'couplet': 'VERSE',
        'refrein': 'CHORUS',
        'brug': 'BRIDGE',
        'uitro': 'OUTRO',
        'einde': 'ENDING',
        'instrumentaal': 'INSTRUMENTAL',
        'intermezzo': 'INTERLUDE',
    };
}
