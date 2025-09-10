
import type { Sermon, User, WeeklyContent } from './types';

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
    transcript: 'This is the full transcript for The Good Shepherd sermon... It is a long text that can be edited.',
    status: 'PUBLISHED',
    languages: ['en', 'es'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    weeklyContentId: 'wc-1'
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
    weeklyContentId: 'wc-2'
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
                if (language === 'en') {
                    return { ...s, transcript, updatedAt: new Date().toISOString() };
                } else {
                    return { ...s, translatedTranscript: transcript, updatedAt: new Date().toISOString() };
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


const initialWeeklyContent: WeeklyContent[] = [
    {
        id: 'wc-1',
        tenantId: 'tenant-1',
        sermonId: 'sermon-1',
        summaryShort: 'A brief look at Psalm 23, highlighting God\'s role as our provider and protector.',
        summaryLong: 'This week\'s devotional guide explores the deep comfort and assurance found in Psalm 23. We delve into the metaphor of the shepherd and his sheep, understanding how God leads us, provides for our needs, restores our souls, and walks with us through life\'s darkest valleys. It\'s a message of profound trust and unwavering divine care.',
        devotionals: [
            { day: 'Monday', content: 'Podcast clip about resting in God\'s care.' },
            { day: 'Tuesday', content: 'Reflection on "The Lord is my shepherd, I shall not want." What does it mean to be content in His provision?' },
            { day: 'Wednesday', content: 'He makes me lie down in green pastures. Where are the "green pastures" in your life where you can find rest?' },
            { day: 'Thursday', content: 'Even though I walk through the valley of the shadow of death, I will fear no evil. How does God\'s presence comfort you in fearful times?' },
            { day: 'Friday', content: 'Surely goodness and mercy shall follow me all the days of my life. Meditate on God\'s persistent goodness.' },
        ],
        reflectionQuestions: [
            {
                audience: 'Individuals',
                questions: [
                    'In what areas of your life do you need to trust God as your shepherd right now?',
                    'How can you find "green pastures" and "still waters" for your soul this week?',
                    'Reflect on a "dark valley" experience. How did you see God\'s presence with you?',
                ],
            },
            {
                audience: 'Small Groups',
                questions: [
                    'Share as a group about what "The Lord is my shepherd" means to each of you personally.',
                    'Discuss the difference between "wanting" and "needing" in the context of Psalm 23.',
                    'How can we, as a group, help each other stay on the "paths of righteousness"?',
                ],
            },
            {
                audience: 'Families',
                questions: [
                  'How can our family "prepare a table" for someone in need this week?',
                  'What does it mean for our "cup to overflow" with blessings as a family?',
                  'In what ways can we "dwell in the house of the Lord" together every day?',
                ],
            },
            {
                audience: 'Youth',
                questions: [
                  'What does the "rod and staff" symbolize to you in terms of protection and guidance?',
                  'How does knowing God is like a shepherd change how you view challenges at school or with friends?',
                  'What does "anointing my head with oil" mean to you in today\'s world?',
                ],
            },
        ],
        games: [
            {
                "type": "Quiz",
                "title": "Quiz on The Good Shepherd",
                "audience": "Adults",
                "data": [
                    {
                        "question": "In Psalm 23, what does the shepherd use to comfort the sheep?",
                        "options": ["His voice", "His rod and staff", "His hands", "His song"],
                        "correctAnswer": "His rod and staff"
                    },
                    {
                        "question": "What does the psalmist say the Lord prepares for him in the presence of his enemies?",
                        "options": ["A shield", "A hiding place", "A table", "A chariot"],
                        "correctAnswer": "A table"
                    },
                    {
                        "question": "According to the sermon, what does 'anointing my head with oil' signify?",
                        "options": ["Healing and consecration", "A declaration of war", "A sign of wealth", "A common greeting"],
                        "correctAnswer": "Healing and consecration"
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
                "type": "Fill in the Blank",
                "title": "Complete the Verse",
                "audience": "Adults",
                "data": {
                    "sentence": "Surely goodness and ______ shall follow me all the days of my life.",
                    "blank": "mercy"
                }
            }
        ],
        mondayClipUrl: 'https://storage.googleapis.com/studioprod-55829.appspot.com/652932b172a5a544256c70c2/sermons/kE3z98a4aT6s1B2aY1E2/audio.mp3',
    },
     {
        id: 'wc-2',
        tenantId: 'tenant-1',
        sermonId: 'sermon-2',
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
    if (typeof window !== 'undefined') {
        const allContent = getMockWeeklyContent();
        const index = allContent.findIndex(c => c.id === content.id);
        if (index > -1) {
            allContent[index] = content;
        } else {
            allContent.push(content);
        }
        sessionStorage.setItem(WEEKLY_CONTENT_STORAGE_KEY, JSON.stringify(allContent));
    }
};

// For initial load, we still need this export for components that use it directly
export const mockWeeklyContent = getMockWeeklyContent();
