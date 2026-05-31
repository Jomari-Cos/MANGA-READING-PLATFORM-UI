export interface Manga {
  id: string;
  title: string;
  cover: string;
  rating: number;
  chapters: number;
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  type: 'Manga' | 'Manhwa' | 'Manhua' | 'Webtoon';
  author: string;
  genres: string[];
  synopsis: string;
  views: string;
  releaseYear: number;
  lastChapter?: string;
  progress?: number;
  source?: string;
}

export interface Chapter {
  id: string;
  number: number | string;
  title: string;
  releaseDate: string;
  read: boolean;
}

export const featuredManga: Manga[] = [
  {
    id: '1',
    title: 'Solo Leveling',
    cover: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80',
    rating: 9.8,
    chapters: 179,
    status: 'Completed',
    type: 'Manhwa',
    author: 'Chugong',
    genres: ['Action', 'Fantasy', 'Adventure'],
    synopsis: 'In a world where hunters fight monsters, the weakest hunter Sung Jin-Woo discovers a mysterious system that allows him to level up endlessly. Follow his journey from E-rank to becoming the world\'s strongest hunter.',
    views: '1.2B',
    releaseYear: 2018
  },
  {
    id: '2',
    title: 'Tower of God',
    cover: 'https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&q=80',
    rating: 9.5,
    chapters: 588,
    status: 'Ongoing',
    type: 'Webtoon',
    author: 'SIU',
    genres: ['Fantasy', 'Mystery', 'Drama'],
    synopsis: 'Bam, a boy who was trapped in a cave, enters the Tower to chase after his only friend Rachel. As he climbs the Tower, he faces increasingly difficult tests and discovers secrets about the Tower and his own identity.',
    views: '980M',
    releaseYear: 2010
  },
  {
    id: '3',
    title: 'Omniscient Reader\'s Viewpoint',
    cover: 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&q=80',
    rating: 9.7,
    chapters: 152,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'Sing Shong',
    genres: ['Fantasy', 'Action', 'Adventure'],
    synopsis: 'Kim Dokja is an ordinary office worker who has read a web novel for 10 years. One day, the novel becomes reality and he\'s the only one who knows how the world will end. Using his knowledge, he fights to survive.',
    views: '850M',
    releaseYear: 2020
  },
  {
    id: '4',
    title: 'The Beginning After The End',
    cover: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    rating: 9.6,
    chapters: 180,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'TurtleMe',
    genres: ['Fantasy', 'Adventure', 'Reincarnation'],
    synopsis: 'King Grey has unrivaled strength, wealth, and prestige in a world governed by martial ability. However, solitude lingers closely behind those with great power. He is reborn into a new world filled with magic and monsters.',
    views: '720M',
    releaseYear: 2018
  }
];

export const trendingManga: Manga[] = [
  {
    id: '5',
    title: 'Jujutsu Kaisen',
    cover: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&q=80',
    rating: 9.4,
    chapters: 248,
    status: 'Ongoing',
    type: 'Manga',
    author: 'Gege Akutami',
    genres: ['Action', 'Supernatural', 'Horror'],
    synopsis: 'Yuji Itadori swallows a cursed finger to protect his friends, becoming the host of a powerful curse.',
    views: '650M',
    releaseYear: 2018
  },
  {
    id: '6',
    title: 'Chainsaw Man',
    cover: 'https://images.unsplash.com/photo-1618556662248-ba4c7b6fb5e9?w=600&q=80',
    rating: 9.3,
    chapters: 148,
    status: 'Ongoing',
    type: 'Manga',
    author: 'Tatsuki Fujimoto',
    genres: ['Action', 'Horror', 'Supernatural'],
    synopsis: 'Denji becomes a devil hunter to pay off his debts, merging with his pet devil Pochita to become Chainsaw Man.',
    views: '580M',
    releaseYear: 2019
  },
  {
    id: '7',
    title: 'Mercenary Enrollment',
    cover: 'https://images.unsplash.com/photo-1544654803-b69140b285a1?w=600&q=80',
    rating: 9.2,
    chapters: 140,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'YC',
    genres: ['Action', 'School Life', 'Drama'],
    synopsis: 'A mercenary survivor returns to Korea and enrolls in high school to find his family.',
    views: '520M',
    releaseYear: 2020
  },
  {
    id: '8',
    title: 'Eleceed',
    cover: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&q=80',
    rating: 9.1,
    chapters: 280,
    status: 'Ongoing',
    type: 'Webtoon',
    author: 'Son Je-Ho',
    genres: ['Action', 'Comedy', 'Supernatural'],
    synopsis: 'Jiwoo is a kind-hearted young man who uses his mysterious cat-like reflexes to help people.',
    views: '490M',
    releaseYear: 2018
  },
  {
    id: '9',
    title: 'Nano Machine',
    cover: 'https://images.unsplash.com/photo-1574441857703-0c0?w=600&q=80',
    rating: 9.0,
    chapters: 165,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'Guem-Gang-Bul-Gae',
    genres: ['Action', 'Fantasy', 'Martial Arts'],
    synopsis: 'Cheon Yeo-Woon, the abandoned son, receives a descendant from the future who implants a nano machine.',
    views: '460M',
    releaseYear: 2020
  },
  {
    id: '10',
    title: 'Wind Breaker',
    cover: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&q=80',
    rating: 8.9,
    chapters: 120,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'Yongseok Jo',
    genres: ['Action', 'Sports', 'School Life'],
    synopsis: 'Jay Jo enters a new school and gets caught up in the world of competitive cycling.',
    views: '430M',
    releaseYear: 2019
  }
];

export const popularManga: Manga[] = [
  {
    id: '11',
    title: 'One Piece',
    cover: 'https://images.unsplash.com/photo-1566404791232-af9fe0ae8f8b?w=600&q=80',
    rating: 9.5,
    chapters: 1100,
    status: 'Ongoing',
    type: 'Manga',
    author: 'Eiichiro Oda',
    genres: ['Action', 'Adventure', 'Comedy'],
    synopsis: 'Monkey D. Luffy dreams of becoming the Pirate King and finding the legendary treasure One Piece.',
    views: '2.1B',
    releaseYear: 1997
  },
  {
    id: '12',
    title: 'My Hero Academia',
    cover: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=600&q=80',
    rating: 9.2,
    chapters: 405,
    status: 'Ongoing',
    type: 'Manga',
    author: 'Kohei Horikoshi',
    genres: ['Action', 'Superhero', 'School Life'],
    synopsis: 'In a world where superpowers are the norm, Izuku Midoriya dreams of becoming a hero despite being powerless.',
    views: '890M',
    releaseYear: 2014
  },
  {
    id: '13',
    title: 'Demon Slayer',
    cover: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=600&q=80',
    rating: 9.4,
    chapters: 205,
    status: 'Completed',
    type: 'Manga',
    author: 'Koyoharu Gotouge',
    genres: ['Action', 'Historical', 'Supernatural'],
    synopsis: 'Tanjiro becomes a demon slayer to save his sister and avenge his family killed by demons.',
    views: '1.5B',
    releaseYear: 2016
  },
  {
    id: '14',
    title: 'Attack on Titan',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
    rating: 9.6,
    chapters: 139,
    status: 'Completed',
    type: 'Manga',
    author: 'Hajime Isayama',
    genres: ['Action', 'Drama', 'Dark Fantasy'],
    synopsis: 'Humanity fights for survival against man-eating giants within massive walls.',
    views: '1.8B',
    releaseYear: 2009
  },
  {
    id: '15',
    title: 'Blue Lock',
    cover: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80',
    rating: 8.8,
    chapters: 245,
    status: 'Ongoing',
    type: 'Manga',
    author: 'Muneyuki Kaneshiro',
    genres: ['Sports', 'Drama'],
    synopsis: '300 high school strikers enter Blue Lock, a prison-like facility, to become the world\'s greatest striker.',
    views: '380M',
    releaseYear: 2018
  }
];

export const newReleases: Manga[] = [
  {
    id: '16',
    title: 'Lookism',
    cover: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=600&q=80',
    rating: 9.0,
    chapters: 475,
    status: 'Ongoing',
    type: 'Webtoon',
    author: 'Park Taejun',
    genres: ['Action', 'Drama', 'School Life'],
    synopsis: 'An overweight, unpopular teen wakes up in a new body and juggles two completely different lives.',
    views: '670M',
    releaseYear: 2014
  },
  {
    id: '17',
    title: 'Villain to Kill',
    cover: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
    rating: 8.7,
    chapters: 95,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'Gyeoeul',
    genres: ['Action', 'Supernatural', 'Revenge'],
    synopsis: 'A top-tier superhero is betrayed and wakes up in a villain\'s body, seeking revenge.',
    views: '310M',
    releaseYear: 2021
  },
  {
    id: '18',
    title: 'Return of the Mount Hua Sect',
    cover: 'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=600&q=80',
    rating: 9.1,
    chapters: 110,
    status: 'Ongoing',
    type: 'Manhwa',
    author: 'Biga',
    genres: ['Action', 'Martial Arts', 'Reincarnation'],
    synopsis: 'Chung Myung, the 13th Disciple of Mount Hua Sect, dies and is reborn 100 years later.',
    views: '420M',
    releaseYear: 2021
  }
];

export const genres = [
  'All',
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Mystery',
  'Psychological'
];

export const mockChapters: Chapter[] = Array.from({ length: 50 }, (_, i) => ({
  id: `chapter-${i + 1}`,
  number: i + 1,
  title: `Chapter ${i + 1}: ${['The Beginning', 'New Powers', 'The Battle', 'Revelation', 'The Turning Point'][i % 5]}`,
  releaseDate: new Date(2024, 0, i + 1).toISOString(),
  read: i < 10
}));
