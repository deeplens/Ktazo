
import { FaithLevel } from './types';

export const faithLevels: FaithLevel[] = [
  // Stage 1 – Foundation
  { name: 'Listener', stage: 'Foundation', minPoints: 0, maxPoints: 2000, quote: 'Faith comes from hearing, and hearing through the word of Christ.', reference: 'Romans 10:17' },
  { name: 'Seeker', stage: 'Foundation', minPoints: 2001, maxPoints: 5000, quote: 'You will seek me and find me when you seek me with all your heart.', reference: 'Jeremiah 29:13' },
  { name: 'Apprentice of the Word', stage: 'Foundation', minPoints: 5001, maxPoints: 10000, quote: 'Like newborn babies, crave pure spiritual milk, so that by it you may grow up in your salvation.', reference: '1 Peter 2:2' },
  // Stage 2 – Growth
  { name: 'Scripture Explorer', stage: 'Growth', minPoints: 10001, maxPoints: 20000, quote: 'Your word is a lamp to my feet and a light to my path.', reference: 'Psalm 119:105' },
  { name: 'Faith Builder', stage: 'Growth', minPoints: 20001, maxPoints: 35000, quote: 'Build yourselves up in your most holy faith and pray in the Holy Spirit.', reference: 'Jude 1:20' },
  { name: 'Disciple-in-Training', stage: 'Growth', minPoints: 35001, maxPoints: 50000, quote: 'Whoever wants to be my disciple must deny themselves and take up their cross daily and follow me.', reference: 'Luke 9:23' },
  // Stage 3 – Strengthening
  { name: 'Light Bearer', stage: 'Strengthening', minPoints: 50001, maxPoints: 75000, quote: 'Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.', reference: 'Matthew 5:16' },
  { name: 'Word Worker', stage: 'Strengthening', minPoints: 75001, maxPoints: 100000, quote: 'Do your best to present yourself to God as one approved, a worker who does not need to be ashamed and who correctly handles the word of truth.', reference: '2 Timothy 2:15' },
  { name: 'Servant Leader', stage: 'Strengthening', minPoints: 100001, maxPoints: 150000, quote: 'Whoever wants to become great among you must be your servant.', reference: 'Mark 10:43' },
  // Stage 4 – Deepening
  { name: 'Armor Bearer', stage: 'Deepening', minPoints: 150001, maxPoints: 200000, quote: 'Put on the full armor of God, so that you can take your stand against the devil’s schemes.', reference: 'Ephesians 6:11' },
  { name: 'Shepherd’s Friend', stage: 'Deepening', minPoints: 200001, maxPoints: 300000, quote: 'I am the good shepherd. The good shepherd lays down his life for the sheep.', reference: 'John 10:11' },
  { name: 'Fruitful Branch', stage: 'Deepening', minPoints: 300001, maxPoints: 400000, quote: 'I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.', reference: 'John 15:5' },
  // Stage 5 – Builders
  { name: 'Mountain Mover', stage: 'Builders', minPoints: 400001, maxPoints: 600000, quote: 'If you have faith as small as a mustard seed… nothing will be impossible for you.', reference: 'Matthew 17:20' },
  { name: 'Living Stone', stage: 'Builders', minPoints: 600001, maxPoints: 800000, quote: 'You also, like living stones, are being built into a spiritual house.', reference: '1 Peter 2:5' },
  { name: 'Kingdom Builder', stage: 'Builders', minPoints: 800001, maxPoints: 1000000, quote: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.', reference: 'Matthew 6:33' },
  // Stage 6 – Overcomers
  { name: 'Fisher of People', stage: 'Overcomers', minPoints: 1000001, maxPoints: 1250000, quote: 'Come, follow me… and I will send you out to fish for people.', reference: 'Matthew 4:19' },
  { name: 'Overcomer', stage: 'Overcomers', minPoints: 1250001, maxPoints: 1500000, quote: 'In this world you will have trouble. But take heart! I have overcome the world.', reference: 'John 16:33' },
  { name: 'Good and Faithful Servant', stage: 'Overcomers', minPoints: 1500001, maxPoints: 2000000, quote: 'Well done, good and faithful servant! …Come and share your master’s happiness.', reference: 'Matthew 25:23' },
  // Stage 7 – Eternal Legacy
  { name: 'Pillar of the Church', stage: 'Eternal Legacy', minPoints: 2000001, maxPoints: 2500000, quote: 'James, Cephas and John, those esteemed as pillars…', reference: 'Galatians 2:9' },
  { name: 'Crown of Life', stage: 'Eternal Legacy', minPoints: 2500001, maxPoints: 3000000, quote: 'Blessed is the one who perseveres under trial… that person will receive the crown of life.', reference: 'James 1:12' },
  { name: 'Light to the Nations', stage: 'Eternal Legacy', minPoints: 3000001, maxPoints: Infinity, quote: 'I will make you as a light for the nations, that my salvation may reach to the end of the earth.', reference: 'Isaiah 49:6' },
];

export function getLevelForPoints(points: number): FaithLevel {
  return faithLevels.find(level => points >= level.minPoints && points <= level.maxPoints) || faithLevels[0];
}
