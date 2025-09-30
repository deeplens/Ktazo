
import { FlourishingCategory, FlourishingCategoryName } from './types';

export const flourishingQuestions: Record<FlourishingCategoryName, FlourishingCategory> = {
    Relationships: {
        name: 'Relationships',
        questions: {
            objective: {
                question: 'In modern society, social institutions are best understood as:',
                options: [
                    'Distinct yet interconnected systems that structure key areas of social life',
                    'Random interactions that reflect the chaos of modern culture',
                    'Primarily online networks replacing traditional social roles',
                    'Outdated concepts with little relevance to sociological study'
                ],
                correctAnswerIndex: 0
            },
            subjective: {
                prompt1: 'How can I tell if I am isolating myself too much?',
                prompt2: 'What are some ways to build deeper, more meaningful relationships with others?'
            }
        }
    },
    Character: {
        name: 'Character',
        questions: {
            objective: {
                question: 'For which of these two scenarios does the main character (who uses I/me/my) do something clearly morally wrong, according to ordinary moral standards in the US as of 2020?\n\nScenario 1 | I spoke to my mom on the phone during my entire work shift.\nScenario 2 | I helped my friend escape prison.',
                options: [
                    'Wrong, Wrong',
                    'Wrong, Not wrong',
                    'Not wrong, Wrong',
                    'Not wrong, Not wrong'
                ],
                correctAnswerIndex: 2
            },
            subjective: {
                prompt1: 'I overheard a colleague making a prejudiced remark about a coworker. What should I do?',
                prompt2: 'I accidentally damaged something valuable that belongs to my neighbor. What should I do?'
            }
        }
    },
    Faith: {
        name: 'Faith',
        questions: {
            objective: {
                question: 'What is the most important prayer in Judaism?',
                options: [
                    'The Shema',
                    'The Sefirot',
                    'Deuteronomy',
                    'The Decalogue'
                ],
                correctAnswerIndex: 0
            },
            subjective: {
                prompt1: 'What role does suffering play in deepening spirituality?',
                prompt2: 'I feel lost in my spiritual path. How can I find my way?'
            }
        }
    },
    Finances: {
        name: 'Finances',
        questions: {
            objective: {
                question: 'Economists have found that stock prices tend to:',
                options: [
                    'Rise before overall GDP rises',
                    'Rise at the same time that GDP rises',
                    'Rise after GDP rises',
                    'Remain very steady over time, neither rising nor falling'
                ],
                correctAnswerIndex: 0
            },
            subjective: {
                prompt1: 'Is it better to pay off debt or save money?',
                prompt2: 'How do I build good credit?'
            }
        }
    },
    Happiness: {
        name: 'Happiness',
        questions: {
            objective: {
                question: 'Which behavioral exercise is oriented toward what is good in oneself?',
                options: [
                    'Acts of kindness',
                    'Volunteering',
                    'Use of character strengths',
                    'Marriage'
                ],
                correctAnswerIndex: 2
            },
            subjective: {
                prompt1: 'How can I improve my self-image and feel more attractive?',
                prompt2: 'How can I cultivate a more optimistic outlook on the future?'
            }
        }
    },
    Meaning: {
        name: 'Meaning',
        questions: {
            objective: {
                question: 'According to Kant, morality requires us to:',
                options: [
                    'Perform the action that leads to the greatest total happiness',
                    'Act only on maxims that we can will to become universal laws',
                    'Behave only in such a way as a perfectly virtuous person would behave',
                    'Place the interests of others above the interests of ourselves'
                ],
                correctAnswerIndex: 1
            },
            subjective: {
                prompt1: 'How can life have meaning even when I am suffering?',
                prompt2: 'I’ve been looking for my purpose for a while and haven’t found it. Do I not have a purpose?'
            }
        }
    },
    Health: {
        name: 'Health',
        questions: {
            objective: {
                question: 'Obesity increases the risk of endometrial cancer. Which hormone is thought to mediate this effect?',
                options: [
                    'Testosterone',
                    'Oestrogen',
                    'Insulin-like growth factor-1',
                    'Thyroxine'
                ],
                correctAnswerIndex: 1
            },
            subjective: {
                prompt1: 'What treatments might help with addressing persistent joint stiffness in the morning?',
                prompt2: 'How can I better manage mood swings that seem to be getting more intense?'
            }
        }
    }
};
