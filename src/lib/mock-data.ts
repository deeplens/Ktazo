

import type { Sermon, User, WeeklyContent, ReflectionAnswer, TenantSettings } from './types';

export const mockUsers: User[] = [
  { id: 'user-master-1', tenantId: 'tenant-1', authId: 'auth-master-1', role: 'MASTER', name: 'Master User', email: 'master@ktazo.com', lastLoginAt: new Date().toISOString(), points: 0 },
  { id: 'user-admin-1', tenantId: 'tenant-1', authId: 'auth-admin-1', role: 'ADMIN', name: 'Admin User', email: 'admin@ktazo.com', lastLoginAt: new Date().toISOString(), points: 120 },
  { id: 'user-pastor-1', tenantId: 'tenant-1', authId: 'auth-pastor-1', role: 'PASTOR', name: 'Pastor User', email: 'pastor@ktazo.com', lastLoginAt: new Date().toISOString(), points: 50 },
  { id: 'user-member-1', tenantId: 'tenant-1', authId: 'auth-member-1', role: 'MEMBER', name: 'Member User 1', email: 'member1@ktazo.com', lastLoginAt: new Date().toISOString(), points: 800 },
  { id: 'user-member-2', tenantId: 'tenant-1', authId: 'auth-member-2', role: 'MEMBER', name: 'Member User 2', email: 'member2@ktazo.com', lastLoginAt: new Date(Date.now() - 86400000 * 2).toISOString(), points: 450 },
  { id: 'user-member-3', tenantId: 'tenant-1', authId: 'auth-member-3', role: 'MEMBER', name: 'Member User 3', email: 'member3@ktazo.com', lastLoginAt: new Date(Date.now() - 86400000 * 5).toISOString(), points: 210 },
];

const initialSermons: Sermon[] = [
  {
    id: 'sermon-1',
    tenantId: 'tenant-1',
    title: 'The Good Shepherd',
    series: 'Psalms',
    speaker: 'Guest Speaker',
    date: '2024-05-12',
    mp3Url: 'https://storage.googleapis.com/studioprod-55829.appspot.com/652932b172a5a544256c70c2/sermons/kE3z98a4aT6s1B2aY1E2/audio.mp3',
    transcript: "This is the full transcript for The Good Shepherd sermon... It is a long text that can be edited.",
    translatedTranscript: "Esta es la transcripción completa del sermón El Buen Pastor...",
    status: 'PUBLISHED',
    languages: ['en', 'es'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    weeklyContentIds: { 'en': 'wc-1-en', 'es': 'wc-1-es' },
    artworkUrl: 'https://picsum.photos/seed/sermon1/1200/800'
  },
  {
    id: 'sermon-2',
    tenantId: 'tenant-1',
    title: 'Faith and Works',
    series: 'James',
    speaker: 'Pastor John',
    date: '2024-05-05',
    mp3Url: 'https://storage.googleapis.com/studioprod-55829.appspot.com/652932b172a5a544256c70c2/sermons/kE3z98a4aT6s1B2aY1E2/audio.mp3',
    transcript: 'The book of James talks about faith and works...',
    status: 'APPROVED',
    languages: ['en'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    weeklyContentIds: { 'en': 'wc-2' }
  },
  {
    id: 'sermon-3',
    tenantId: 'tenant-1',
    title: 'The Prodigal Son',
    series: 'Parables of Jesus',
    speaker: 'Pastor Jane',
    date: '2024-04-28',
    mp3Url: 'https://storage.googleapis.com/studioprod-55829.appspot.com/652932b172a5a544256c70c2/sermons/kE3z98a4aT6s1B2aY1E2/audio.mp3',
    transcript: '...',
    status: 'READY_FOR_REVIEW',
    languages: ['en'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sermon-4',
    tenantId: 'tenant-1',
    title: 'Creation and Rest',
    series: 'Genesis',
    speaker: 'Pastor John',
    date: '2024-04-21',
    mp3Url: '',
    transcript: '',
    status: 'DRAFT',
    languages: ['en'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


const SERMON_STORAGE_KEY = 'ktazo-sermons';

export const getMockSermons = (): Sermon[] => {
    if (typeof window !== 'undefined') {
        const storedSermons = sessionStorage.getItem(SERMON_STORAGE_KEY);
        if (storedSermons) {
            try {
                return JSON.parse(storedSermons);
            } catch (e) {
                console.error("Could not parse stored sermons", e);
                // If parsing fails, initialize with default
                sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(initialSermons));
                return initialSermons;
            }
        } else {
             // If no data, initialize with default
             sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(initialSermons));
             return initialSermons;
        }
    }
    return initialSermons;
}

export const addSermon = (sermon: Sermon) => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = [sermon, ...sermons];
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
}

export const deleteSermon = (sermonId: string) => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = sermons.filter(s => s.id !== sermonId);
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
};

export const updateSermonTranscript = (sermonId: string, transcript: string, language: 'en' | 'es') => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = sermons.map(s => {
            if (s.id === sermonId) {
                const updatedLanguages = s.languages;
                if (language === 'es' && !updatedLanguages.includes('es')) {
                    updatedLanguages.push('es');
                }
                if (language === 'en') {
                    return { ...s, transcript, updatedAt: new Date().toISOString() };
                } else {
                    return { ...s, translatedTranscript: transcript, languages: updatedLanguages, updatedAt: new Date().toISOString() };
                }
            }
            return s;
        });
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
};

export const updateSermonStatus = (sermonId: string, status: Sermon['status']) => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = sermons.map(s => {
            if (s.id === sermonId) {
                return { ...s, status, updatedAt: new Date().toISOString() };
            }
            return s;
        });
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
};

export const updateSermonDetails = (sermonId: string, details: Partial<Pick<Sermon, 'title' | 'speaker' | 'series' | 'date'>>) => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = sermons.map(s => {
            if (s.id === sermonId) {
                return { ...s, ...details, updatedAt: new Date().toISOString() };
            }
            return s;
        });
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
};

export const updateSermonArtwork = (sermonId: string, artworkUrl: string) => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = sermons.map(s => {
            if (s.id === sermonId) {
                return { ...s, artworkUrl, updatedAt: new Date().toISOString() };
            }
            return s;
        });
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
};

export const updateSermonWeeklyContentId = (sermonId: string, weeklyContentId: string, language: string) => {
    if (typeof window !== 'undefined') {
        const sermons = getMockSermons();
        const updatedSermons = sermons.map(s => {
            if (s.id === sermonId) {
                const newWeeklyContentIds = { ...(s.weeklyContentIds || {}), [language]: weeklyContentId };
                return { ...s, weeklyContentIds: newWeeklyContentIds, updatedAt: new Date().toISOString() };
            }
            return s;
        });
        sessionStorage.setItem(SERMON_STORAGE_KEY, JSON.stringify(updatedSermons));
    }
};


const initialWeeklyContent: WeeklyContent[] = [
    {
        id: "wc-1-en",
        tenantId: "tenant-1",
        sermonId: "sermon-1",
        language: 'en',
        summaryShort: "A brief look at Psalm 23, highlighting God's role as our provider and protector.",
        summaryLong: "This week's devotional guide explores the deep comfort and assurance found in Psalm 23. We delve into the metaphor of the shepherd and his sheep, understanding how God leads us, provides for our needs, restores our souls, and walks with us through life's darkest valleys. It's a message of profound trust and unwavering divine care.",
        devotionals: [
            { day: "Monday", content: "Podcast clip about resting in God's care. This devotional is now much longer to provide more substance for the reader. It delves deeper into the themes of the sermon and offers more for reflection. We can expand on the idea of rest and what it truly means to trust in God's provision. We can explore the contrast between worldly striving and spiritual peace." },
            { day: "Tuesday", content: "Reflection on 'The Lord is my shepherd, I shall not want.' What does it mean to be content in His provision? This section is also expanded to provide a richer experience. We can discuss the societal pressures of wanting more and how a relationship with God can free us from that cycle. Practical steps to cultivate contentment can be included." },
            { day: "Wednesday", content: "He makes me lie down in green pastures. Where are the 'green pastures' in your life where you can find rest? A longer devotional allows for a more detailed exploration of this metaphor. We can talk about creating intentional spaces for spiritual rest and renewal in our busy lives, and what those spaces might look like for different people." },
            { day: "Thursday", content: "Even though I walk through the valley of the shadow of death, I will fear no evil. How does God's presence comfort you in fearful times? This devotional is now twice as long, allowing for a more sensitive and thorough handling of a difficult topic. We can include stories or examples of how faith provides strength in dark times, and offer specific scriptures for comfort." },
            { day: "Friday", content: "Surely goodness and mercy shall follow me all the days of my life. Meditate on God's persistent goodness. This expanded devotional provides a more triumphant and worshipful conclusion to the week. We can encourage the reader to look back on their week and identify moments of God's goodness and mercy, fostering a heart of gratitude." },
        ],
        reflectionQuestions: [
            {
                audience: "Individuals",
                questions: [
                    "In what areas of your life do you need to trust God as your shepherd right now?",
                    "How can you find 'green pastures' and 'still waters' for your soul this week?",
                    "Reflect on a 'dark valley' experience. How did you see God's presence with you?",
                ],
            },
            {
                audience: "Small Groups",
                questions: [
                    "Share as a group about what 'The Lord is my shepherd' means to each of you personally.",
                    "Discuss the difference between 'wanting' and 'needing' in the context of Psalm 23.",
                    "How can we, as a group, help each other stay on the 'paths of righteousness'?",
                ],
            },
            {
                audience: "Families",
                questions: [
                  "How can our family 'prepare a table' for someone in need this week?",
                  "What does it mean for our 'cup to overflow' with blessings as a family?",
                  "In what ways can we 'dwell in the house of the Lord' together every day?",
                ],
            },
            {
                audience: "Youth",
                questions: [
                  "What does the 'rod and staff' symbolize to you in terms of protection and guidance?",
                  "How does knowing God is like a shepherd change how you view challenges at school or with friends?",
                  "What does 'anointing my head with oil' mean to you in today's world?",
                ],
            },
        ],
        games: [
            {
                "type": "Verse Scramble",
                "title": "Unscramble Psalm 23:1",
                "audience": "Adults",
                "data": {
                    "verse": "The Lord is my shepherd; I shall not want.",
                    "reference": "Psalm 23:1"
                }
            },
            {
                "type": "Jeopardy",
                "title": "Psalm 23 Jeopardy",
                "audience": "Adults",
                "data": [
                    {
                        "title": "Key Figures",
                        "questions": [
                            { "question": "He is described as 'my shepherd'.", "answer": "The Lord", "points": 100 },
                            { "question": "I will fear no evil, for you are with me; your rod and your ____, they comfort me.", "answer": "Staff", "points": 200 },
                            { "question": "The psalmist declares that he will dwell in the house of the Lord for this long.", "answer": "Forever", "points": 300 }
                        ]
                    },
                    {
                        "title": "Places & Things",
                        "questions": [
                            { "question": "He makes me lie down in these.", "answer": "Green pastures", "points": 100 },
                            { "question": "He leads me beside these.", "answer": "Still waters", "points": 200 },
                            { "question": "This is prepared for the psalmist in the presence of his enemies.", "answer": "A table", "points": 300 }
                        ]
                    }
                ]
            },
            {
                "type": "Word Search",
                "title": "Psalm 23 Word Hunt",
                "audience": "Youth",
                "data": {
                    "words": ["SHEPHERD", "VALLEY", "COMFORT", "ANOINTS", "MERCY", "GOODNESS", "PASTURES", "TABLE"]
                }
            },
            {
                type: 'Fill in the Blank',
                title: 'Complete the Verse',
                audience: 'Adults',
                data: [
                    { sentence: 'The Lord is my ___...', blank: 'shepherd' },
                    { sentence: 'He makes me lie down in green ___...', blank: 'pastures' },
                    { sentence: 'He leads me beside still ___...', blank: 'waters' },
                    { sentence: 'I will fear no ___, for you are with me.', blank: 'evil' },
                ],
            },
            {
                type: 'Matching',
                title: 'Key Concepts',
                audience: 'Adults',
                data: [
                    { id: 1, term: 'Green Pastures', definition: 'A place of rest and provision.' },
                    { id: 2, term: 'Still Waters', definition: 'A source of peace and refreshment.' },
                    { id: 3, term: 'Rod and Staff', definition: 'Symbols of protection and guidance.' },
                    { id: 4, term: 'Valley of Shadow', definition: 'A representation of life\'s darkest trials.' },
                ],
            },
            {
                type: 'Word Guess',
                title: 'Guess the Key Word',
                audience: 'Youth',
                data: [
                    { word: 'RIGHTEOUSNESS', hint: 'The quality of being morally right or justifiable.' },
                    { word: 'SHEPHERD', hint: 'One who tends and herds sheep.' },
                    { word: 'COMFORT', hint: 'A state of physical ease and freedom from pain or constraint.' },
                    { word: 'FOREVER', hint: 'For all future time; for always.' },
                ],
            },
            {
                type: 'Wordle',
                title: 'Sermon Wordle',
                audience: 'Adults',
                data: {
                    word: 'GRACE'
                }
            }
        ],
        bibleReadingPlan: [
            {
                "theme": "The Shepherd Motif",
                "passages": [
                    { "reference": "John 10:11-18", "explanation": "Jesus declares Himself as the 'Good Shepherd' who lays down His life for the sheep, directly echoing the protective and sacrificial nature of the shepherd in Psalm 23." },
                    { "reference": "Ezekiel 34:11-16", "explanation": "This Old Testament prophecy depicts God as a shepherd who will search for, rescue, and care for His scattered flock, providing a rich background for the personal relationship described in Psalm 23." },
                    { "reference": "1 Peter 5:2-4", "explanation": "Peter exhorts church elders to 'shepherd the flock of God,' showing how the shepherd metaphor is extended to human leaders who are to care for God's people under the authority of the Chief Shepherd, Jesus." }
                ]
            },
            {
                "theme": "Divine Provision and Rest",
                "passages": [
                    { "reference": "Matthew 6:25-34", "explanation": "Jesus' teaching on not worrying about daily needs complements the Psalmist's declaration 'I shall not want.' Both passages point to a radical trust in God's provision." },
                    { "reference": "Hebrews 4:9-11", "explanation": "The 'green pastures' and 'still waters' of Psalm 23 are a picture of spiritual rest. This passage in Hebrews speaks of a 'Sabbath-rest for the people of God,' linking physical rest to the ultimate spiritual rest found in Christ." }
                ]
            }
        ],
        spiritualPractices: [
            { "title": "Practice Gratitude", "description": "Keep a journal for a week. Each day, write down three specific things you are thankful for, reflecting on God's provision in your life." },
            { "title": "Practice Hospitality", "description": "Prepare a 'table' for someone this week. Invite a neighbor, coworker, or friend for a meal, coffee, or a simple conversation, showing them unexpected kindness." },
            { "title": "Find Your 'Green Pasture'", "description": "Intentionally schedule 20 minutes of uninterrupted quiet time this week. Go to a park, a quiet room, or any place you can be still and rest in God's presence without distractions." }
        ],
        mondayClipUrl: 'https://storage.googleapis.com/studioprod-55829.appspot.com/652932b172a5a544256c70c2/sermons/kE3z98a4aT6s1B2aY1E2/audio.mp3',
    },
    {
        id: "wc-1-es",
        tenantId: "tenant-1",
        sermonId: "sermon-1",
        language: 'es',
        summaryShort: "Un breve vistazo al Salmo 23, destacando el papel de Dios como nuestro proveedor y protector.",
        summaryLong: "La guía devocional de esta semana explora el profundo consuelo y la seguridad que se encuentran en el Salmo 23...",
        devotionals: [
            { day: "Lunes", content: "Clip de podcast sobre descansar en el cuidado de Dios..." },
            { day: "Martes", content: "Reflexión sobre 'El Señor es mi pastor, nada me faltará.'..." },
            { day: "Miércoles", content: "En lugares de delicados pastos me hará descansar..." },
            { day: "Jueves", content: "Aunque ande en valle de sombra de muerte, no temeré mal alguno..." },
            { day: "Viernes", content: "Ciertamente el bien y la misericordia me seguirán todos los días de mi vida..." },
        ],
        reflectionQuestions: [],
        games: [],
        bibleReadingPlan: [],
        spiritualPractices: [],
    },
     {
        id: 'wc-2',
        tenantId: 'tenant-1',
        sermonId: 'sermon-2',
        language: 'en',
        summaryShort: 'Exploring the connection between genuine faith and tangible actions as described in the book of James.',
        summaryLong: 'This study from the book of James challenges us to examine the nature of our faith. Is it a passive belief or an active, living force? We will see that James is not advocating for salvation by works, but is instead arguing that true, saving faith inevitably produces good works. It is a call to a faith that is visible, practical, and transformative.',
        devotionals: [
            { day: 'Monday', content: 'Podcast intro to Faith and Works.' },
            { day: 'Tuesday', content: 'What good is it, my brothers, if someone says he has faith but does not have works? Can that faith save him? Reflect on this question.' },
            { day: 'Wednesday', content: 'Consider a time your actions were a direct result of your faith.' },
            { day: 'Thursday', content: 'How can we show our faith by our works in our community this week?' },
            { day: 'Friday', content: 'Faith without works is dead. Pray for a faith that is alive and active.' },
        ],
        reflectionQuestions: [],
        games: [],
        bibleReadingPlan: [],
        spiritualPractices: [],
    }
];

const WEEKLY_CONTENT_STORAGE_KEY = 'ktazo-weekly-content';

export const getMockWeeklyContent = (): WeeklyContent[] => {
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(WEEKLY_CONTENT_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                sessionStorage.setItem(WEEKLY_CONTENT_STORAGE_KEY, JSON.stringify(initialWeeklyContent));
                return initialWeeklyContent;
            }
        } else {
             sessionStorage.setItem(WEEKLY_CONTENT_STORAGE_KEY, JSON.stringify(initialWeeklyContent));
             return initialWeeklyContent;
        }
    }
    return initialWeeklyContent;
};

export const saveWeeklyContent = (content: WeeklyContent) => {
    if (typeof window === 'undefined') return;

    let allContent = getMockWeeklyContent();
    const index = allContent.findIndex(c => c.id === content.id);

    if (index > -1) {
        allContent[index] = content;
    } else {
        allContent.push(content);
    }

    const trySave = (data: WeeklyContent[]) => {
        try {
            sessionStorage.setItem(WEEKLY_CONTENT_STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                return false;
            }
            console.error("Failed to save to session storage", e);
            // For other errors, we might not want to trim data.
            return true; 
        }
    };
    
    // Attempt to save the updated content
    if (trySave(allContent)) {
        return; // Success
    }

    // If it fails due to quota, start trimming old content
    console.warn("Session storage quota exceeded. Trimming old content.");

    // Sort content by a timestamp derived from the ID, oldest first
    const sortedContent = allContent.sort((a, b) => {
        const timeA = parseInt(a.id.split('-').pop() || '0');
        const timeB = parseInt(b.id.split('-').pop() || '0');
        return timeA - timeB;
    });

    // Remove old items one by one until it fits, but don't remove the one we're trying to save
    for (let i = 0; i < sortedContent.length; i++) {
        const itemToRemove = sortedContent[i];
        if (itemToRemove.id === content.id) continue; // Don't remove the current item

        const indexToRemove = allContent.findIndex(c => c.id === itemToRemove.id);
        if (indexToRemove > -1) {
            allContent.splice(indexToRemove, 1);
        }

        // Try saving again
        if (trySave(allContent)) {
            console.log("Successfully saved after trimming old content.");
            return;
        }
    }

    // If we're here, it means even after removing all other content, the current item is too large.
    // This is an edge case, but we should handle it.
    console.error(`The content with ID "${content.id}" is too large to be saved to session storage on its own.`);
    // As a last resort, we could clear everything BUT the auth key, and try to save just this one item.
    // For this app, we'll just log the error to avoid destructive actions.
};


const REFLECTION_ANSWERS_KEY = 'ktazo-reflection-answers';
const initialReflectionAnswers: ReflectionAnswer[] = [];

export const getMockReflectionAnswers = (): ReflectionAnswer[] => {
    if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(REFLECTION_ANSWERS_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return initialReflectionAnswers;
            }
        }
    }
    return initialReflectionAnswers;
};

export const getAnswersForSermon = (userId: string, sermonId: string): Record<string, string> => {
    const allAnswers = getMockReflectionAnswers();
    const userSermonAnswers = allAnswers.find(a => a.userId === userId && a.sermonId === sermonId);
    return userSermonAnswers ? userSermonAnswers.answers : {};
};

export const saveAnswersForSermon = (userId: string, sermonId: string, answers: Record<string, string>) => {
    if (typeof window !== 'undefined') {
        let allAnswers = getMockReflectionAnswers();
        const existingAnswerIndex = allAnswers.findIndex(a => a.userId === userId && a.sermonId === sermonId);

        if (existingAnswerIndex > -1) {
            allAnswers[existingAnswerIndex].answers = answers;
        } else {
            allAnswers.push({
                id: `ans-${userId}-${sermonId}`,
                userId,
                sermonId,
                answers,
            });
        }
        sessionStorage.setItem(REFLECTION_ANSWERS_KEY, JSON.stringify(allAnswers));
    }
};


const TENANT_SETTINGS_KEY = 'ktazo-tenant-settings';
const initialTenantSettings: { [key: string]: TenantSettings } = {
  'tenant-1': {
    optionalServices: {
      ourDailyBread: false,
    },
  },
};

export const getTenantSettings = (tenantId: string): TenantSettings => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(TENANT_SETTINGS_KEY);
    if (stored) {
      try {
        const allSettings = JSON.parse(stored);
        return allSettings[tenantId] || initialTenantSettings[tenantId];
      } catch (e) {
        return initialTenantSettings[tenantId];
      }
    } else {
      sessionStorage.setItem(TENANT_SETTINGS_KEY, JSON.stringify(initialTenantSettings));
      return initialTenantSettings[tenantId];
    }
  }
  return initialTenantSettings[tenantId];
};

export const saveTenantSettings = (tenantId: string, settings: TenantSettings) => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(TENANT_SETTINGS_KEY);
    let allSettings = {};
    if (stored) {
      try {
        allSettings = JSON.parse(stored);
      } catch (e) {
        allSettings = {};
      }
    }
    const updatedSettings = { ...allSettings, [tenantId]: settings };
    sessionStorage.setItem(TENANT_SETTINGS_KEY, JSON.stringify(updatedSettings));
  }
};


// For initial load, we still need this export for components that use it directly
export const mockWeeklyContent = getMockWeeklyContent();





    