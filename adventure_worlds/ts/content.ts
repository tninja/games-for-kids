export type Option = [string, string, string, boolean];
export type Scene = [string, string, string, string, string, Option[]];
export interface World { id: string; title: string; zh: string; icon: string; color: string; subtitle: string; reward: string; trophy: string; scenes: Scene[] }
export const worlds: World[] = [
  {
    "id": "dragon",
    "title": "Dragon Kingdom",
    "zh": "龙族世界",
    "icon": "🐉",
    "color": "#934c58",
    "subtitle": "The egg that ordered breakfast",
    "reward": "Moon Dragon Egg",
    "trophy": "🥚",
    "scenes": [
      [
        "Breakfast disaster",
        "🍎",
        "A talking dragon egg rolls into the kitchen. Spicy whispers, ‘Please don't let me cook. Last time I set water on fire.’ The egg speaks:",
        "我|wǒ/要|yào/苹果|píng guǒ/。|",
        "I want an apple.",
        [
          [
            "给|gěi/它|tā/苹果|píng guǒ",
            "Give it an apple",
            "The egg burps a tiny rainbow. ‘Excellent service!’",
            true
          ],
          [
            "给|gěi/它|tā/水|shuǐ",
            "Give it water",
            "The egg rolls away from the cup. ‘I'm hungry, not thirsty!’",
            false
          ],
          [
            "给|gěi/它|tā/鱼|yú",
            "Give it fish",
            "Spicy eats the fish. The egg looks offended.",
            false
          ]
        ]
      ],
      [
        "The wobbly bridge",
        "🌉",
        "The egg hatches into a tiny dragon named Noodle. At a bridge, Noodle points to a hiding place.",
        "钥匙|yào shi/在|zài/左边|zuǒ biān/。|",
        "The key is on the left.",
        [
          [
            "去|qù/右边|yòu biān",
            "Go right",
            "A duck asks if you are lost. It is wearing a tiny hat.",
            false
          ],
          [
            "去|qù/左边|zuǒ biān",
            "Go left",
            "You find a silver key under a leaf.",
            true
          ],
          [
            "跳|tiào/下去|xià qù",
            "Jump down",
            "Noodle hands you a towel. ‘We are not fish.’",
            false
          ]
        ]
      ],
      [
        "Two doors",
        "🏰",
        "Your key opens the castle courtyard. Two colorful doors stand before you. A sign says:",
        "不要|bú yào/开|kāi/红色|hóng sè/的|de/门|mén/。|",
        "Don't open the red door.",
        [
          [
            "开|kāi/红色|hóng sè/的|de/门|mén",
            "Open the red door",
            "A chicken in a crown throws confetti. ‘Wrong party!’",
            false
          ],
          [
            "开|kāi/蓝色|lán sè/的|de/门|mén",
            "Open the blue door",
            "You find a map to a lost moon egg.",
            true
          ],
          [
            "关门|guān mén",
            "Close the door",
            "The doors are already closed. Noodle applauds your door skills.",
            false
          ]
        ]
      ],
      [
        "The moon egg",
        "🌙",
        "A sleepy dragon guards the moon egg. The queen leaves instructions. The guard is holding an empty cup.",
        "先|xiān/给|gěi/它|tā/水|shuǐ/，|/再|zài/拿|ná/龙蛋|lóng dàn/。|",
        "Give it water first, then take the dragon egg.",
        [
          [
            "先|xiān/拿|ná/龙蛋|lóng dàn",
            "Take the egg first",
            "The guard wakes up. ‘My water, please?’",
            false
          ],
          [
            "只|zhǐ/拿|ná/龙蛋|lóng dàn",
            "Just take the egg",
            "Noodle points at the empty cup.",
            false
          ],
          [
            "先|xiān/给|gěi/它|tā/水|shuǐ",
            "Give it water first",
            "You give it water and then take the egg. The queen awards you a Moon Dragon Egg!",
            true
          ]
        ]
      ]
    ]
  },
  {
    "id": "mystery",
    "title": "Monster Mystery",
    "zh": "怪兽小镇",
    "icon": "👾",
    "color": "#7853a7",
    "subtitle": "The case of the missing lunches",
    "reward": "Monster Detective Notebook",
    "trophy": "📓",
    "scenes": [
      [
        "The empty lunch boxes",
        "🎒",
        "Everyone's lunch is missing! Detective Pip finds a note from the lunch lady.",
        "怪兽|guài shòu/在|zài/桌子|zhuō zi/下|xià/。|",
        "The monster is under the table.",
        [
          [
            "看|kàn/桌子|zhuō zi/下|xià",
            "Look under the table",
            "You find crumbs and a purple footprint.",
            true
          ],
          [
            "看|kàn/桌子|zhuō zi/上|shàng",
            "Look on the table",
            "A pencil looks suspicious. It refuses to talk.",
            false
          ],
          [
            "看|kàn/门|mén/后|hòu",
            "Look behind the door",
            "A teacher asks if you have seen her sandwich.",
            false
          ]
        ]
      ],
      [
        "The sock suspect",
        "🧦",
        "A walking sock pile blocks the hall. Pip opens the monster notebook.",
        "它|tā/怕|pà/水|shuǐ/，|/不怕|bú pà/袜子|wà zi/。|",
        "It is afraid of water, not socks.",
        [
          [
            "给|gěi/它|tā/水|shuǐ",
            "Offer it water",
            "It squeaks and runs away. A trail leads to the gym!",
            true
          ],
          [
            "给|gěi/它|tā/袜子|wà zi",
            "Give it socks",
            "The monster becomes twice as big and twice as smelly.",
            false
          ],
          [
            "给|gěi/它|tā/苹果|píng guǒ",
            "Give it an apple",
            "It wears the apple as a hat.",
            false
          ]
        ]
      ],
      [
        "Two lockers",
        "🔎",
        "Two lockers stand in the gym. One makes suspicious chewing noises. A note says:",
        "开|kāi/小|xiǎo/门|mén/，|/不要|bú yào/开|kāi/大|dà/门|mén/。|",
        "Open the small door, not the big door.",
        [
          [
            "开|kāi/大|dà/门|mén",
            "Open the big door",
            "Basketballs bounce out. Pip gets bonked by a foam ball.",
            false
          ],
          [
            "关|guān/小|xiǎo/门|mén",
            "Close the small door",
            "A muffled voice says, ‘Hello? Anybody?’",
            false
          ],
          [
            "开|kāi/小|xiǎo/门|mén",
            "Open the small door",
            "You find a lunch monster with a gigantic sandwich!",
            true
          ]
        ]
      ],
      [
        "A lunch treaty",
        "🥪",
        "The monster is just hungry. The lunch lady offers a deal.",
        "先|xiān/还|huán/午饭|wǔ fàn/，|/再|zài/吃|chī/苹果|píng guǒ/。|",
        "Return the lunches first, then eat an apple.",
        [
          [
            "先|xiān/吃|chī/苹果|píng guǒ",
            "Eat the apple first",
            "Everyone waits while the monster chews.",
            false
          ],
          [
            "先|xiān/还|huán/午饭|wǔ fàn",
            "Return the lunches first",
            "The monster returns the lunches, gets its apple, and you earn a detective notebook.",
            true
          ],
          [
            "藏|cáng/午饭|wǔ fàn",
            "Hide the lunches",
            "The monster hides a sandwich behind its back. Everyone can see it.",
            false
          ]
        ]
      ]
    ]
  },
  {
    "id": "creatures",
    "title": "Creature Trainers",
    "zh": "精灵大陆",
    "icon": "⚡",
    "color": "#227e72",
    "subtitle": "A tiny fox with a big spark",
    "reward": "Thunder Fox Companion",
    "trophy": "🦊",
    "scenes": [
      [
        "The first companion",
        "🌿",
        "Three little creatures hide in the meadow. The trainer tells you which fox is electric.",
        "找|zhǎo/黄色|huáng sè/的|de/狐狸|hú li/。|",
        "Find the yellow fox.",
        [
          [
            "找|zhǎo/蓝色|lán sè/的|de/狐狸|hú li",
            "Find the blue fox",
            "A blue fox sprays a fountain.",
            false
          ],
          [
            "找|zhǎo/黄色|huáng sè/的|de/狐狸|hú li",
            "Find the yellow fox",
            "A yellow fox jumps into your bag and sparks happily.",
            true
          ],
          [
            "找|zhǎo/黄色|huáng sè/的|de/鸟|niǎo",
            "Find the yellow bird",
            "The bird says, ‘Wrong species!’",
            false
          ]
        ]
      ],
      [
        "Practice battle",
        "💧",
        "Thunder Fox meets a friendly water creature for a practice match. The trainer gives a clue.",
        "它|tā/怕|pà/闪电|shǎn diàn/，|/不怕|bú pà/水|shuǐ/。|",
        "It is afraid of lightning, not water.",
        [
          [
            "用|yòng/水|shuǐ",
            "Use water",
            "The water creature takes a bath. ‘Thanks!’",
            false
          ],
          [
            "用|yòng/火|huǒ",
            "Use fire",
            "The trainer stops the round and points to the clue.",
            false
          ],
          [
            "用|yòng/闪电|shǎn diàn",
            "Use lightning",
            "A harmless practice spark wins the round.",
            true
          ]
        ]
      ],
      [
        "A tired teammate",
        "💚",
        "The fox is tired. The healer points at a sign.",
        "小狐狸|xiǎo hú li/要|yào/休息|xiū xi/。|",
        "The little fox needs to rest.",
        [
          [
            "让|ràng/它|tā/休息|xiū xi",
            "Let it rest",
            "It snores tiny sparks and wakes up refreshed.",
            true
          ],
          [
            "让|ràng/它|tā/跑步|pǎo bù",
            "Make it run",
            "It takes one step and lies down again.",
            false
          ],
          [
            "让|ràng/它|tā/跳|tiào",
            "Make it jump",
            "Only its ears jump.",
            false
          ]
        ]
      ],
      [
        "Friendship trial",
        "🏅",
        "A little bird is stuck behind a gate. Thunder Fox can open it, but the trainer gives two instructions.",
        "先|xiān/保护|bǎo hù/小鸟|xiǎo niǎo/，|/再|zài/开门|kāi mén/。|",
        "Protect the little bird first, then open the gate.",
        [
          [
            "先|xiān/开门|kāi mén",
            "Open the gate first",
            "The bird flutters nervously. Read the first action.",
            false
          ],
          [
            "先|xiān/保护|bǎo hù/小鸟|xiǎo niǎo",
            "Protect the bird first",
            "You shield the bird, then open the gate. Thunder Fox joins your team!",
            true
          ],
          [
            "只|zhǐ/保护|bǎo hù/自己|zì jǐ",
            "Protect only yourself",
            "The bird still needs your help.",
            false
          ]
        ]
      ]
    ]
  },
  {
    "id": "soccer",
    "title": "Road to Glory",
    "zh": "足球冠军之路",
    "icon": "⚽",
    "color": "#287451",
    "subtitle": "The cup final",
    "reward": "Teamwork Cup",
    "trophy": "🏆",
    "scenes": [
      [
        "The kickoff",
        "🏟️",
        "You're playing left back in the cup final. Your teammate rushes forward. The coach calls:",
        "保护|bǎo hù/球门|qiú mén/。|",
        "Protect the goal.",
        [
          [
            "向前|xiàng qián/跑|pǎo",
            "Run forward",
            "The opponent sees the gap behind you. The game rewinds.",
            false
          ],
          [
            "保护|bǎo hù/球门|qiú mén",
            "Protect the goal",
            "You intercept a counterattack. Your team cheers!",
            true
          ],
          [
            "去|qù/喝水|hē shuǐ",
            "Go drink water",
            "The goalkeeper shouts, ‘Water break is later!’",
            false
          ]
        ]
      ],
      [
        "The pressing opponent",
        "⚽",
        "You win the ball. A striker blocks your path. Your coach spots an open teammate.",
        "向右|xiàng yòu/传球|chuán qiú/，|/不要|bú yào/带球|dài qiú/。|",
        "Pass right; don't dribble.",
        [
          [
            "向右|xiàng yòu/传球|chuán qiú",
            "Pass right",
            "Your pass breaks the press!",
            true
          ],
          [
            "向前|xiàng qián/带球|dài qiú",
            "Dribble forward",
            "The striker blocks the lane. Try the other action.",
            false
          ],
          [
            "向左|xiàng zuǒ/传球|chuán qiú",
            "Pass left",
            "That lane is crowded.",
            false
          ]
        ]
      ],
      [
        "Help your teammate",
        "🛡️",
        "Your teammate is defending a fast winger. A striker is running toward your goal.",
        "先|xiān/回防|huí fáng/，|/再|zài/帮|bāng/队友|duì yǒu/。|",
        "Recover on defense first, then help your teammate.",
        [
          [
            "先|xiān/射门|shè mén",
            "Shoot first",
            "You don't have the ball! The assistant coach drops his clipboard.",
            false
          ],
          [
            "留在|liú zài/前面|qián miàn",
            "Stay up front",
            "The defense needs cover.",
            false
          ],
          [
            "先|xiān/回防|huí fáng",
            "Recover on defense first",
            "You cover the striker and support your teammate.",
            true
          ]
        ]
      ],
      [
        "The winning move",
        "🥅",
        "It is 1–1. A defender blocks your shot. A teammate is open. The coach has a plan.",
        "不能|bù néng/射门|shè mén/，|/就|jiù/传球|chuán qiú/。|",
        "If you cannot shoot, pass the ball.",
        [
          [
            "自己|zì jǐ/射门|shè mén",
            "Shoot yourself",
            "The defender blocks it. The game rewinds.",
            false
          ],
          [
            "传球|chuán qiú",
            "Pass the ball",
            "Your teammate scores! You win the Teamwork Cup.",
            true
          ],
          [
            "把|bǎ/球|qiú/踢出|tī chū/球场|qiú chǎng",
            "Kick the ball out",
            "The ball lands beside the mascot's popcorn.",
            false
          ]
        ]
      ]
    ]
  }
];

export const normalClues: Record<string, [string, string][]> = {
  "dragon": [
    [
      "我|wǒ/现在|xiàn zài/很|hěn/饿|è/，|/想|xiǎng/吃|chī/一个|yí ge/苹果|píng guǒ/。|",
      "I am hungry now and want to eat an apple."
    ],
    [
      "钥匙|yào shi/在|zài/桥|qiáo/的|de/左边|zuǒ biān/，|/不在|bú zài/右边|yòu biān/。|",
      "The key is on the left side of the bridge, not the right."
    ],
    [
      "红色|hóng sè/的|de/门|mén/很|hěn/危险|wēi xiǎn/，|/请|qǐng/打开|dǎ kāi/蓝色|lán sè/的|de/门|mén/。|",
      "The red door is dangerous. Please open the blue door."
    ],
    [
      "先|xiān/给|gěi/小龙|xiǎo lóng/一杯|yì bēi/水|shuǐ/，|/等|děng/它|tā/喝完|hē wán/，|/再|zài/拿|ná/龙蛋|lóng dàn/。|",
      "First give the little dragon a cup of water. Wait until it finishes, then take the egg."
    ]
  ],
  "mystery": [
    [
      "怪兽|guài shòu/不在|bú zài/门|mén/后面|hòu miàn/，|/它|tā/藏在|cáng zài/桌子|zhuō zi/下面|xià miàn/。|",
      "The monster is not behind the door. It is hiding under the table."
    ],
    [
      "怪兽|guài shòu/喜欢|xǐ huan/袜子|wà zi/，|/但是|dàn shì/很|hěn/怕|pà/水|shuǐ/。|",
      "The monster likes socks, but is very afraid of water."
    ],
    [
      "不要|bú yào/打开|dǎ kāi/大的|dà de/柜子|guì zi/，|/声音|shēng yīn/是|shì/从|cóng/小|xiǎo/柜子|guì zi/里|lǐ/传来|chuán lái/的|de/。|",
      "Don't open the big locker. The sound is coming from the small locker."
    ],
    [
      "如果|rú guǒ/你|nǐ/想|xiǎng/吃|chī/苹果|píng guǒ/，|/就|jiù/先|xiān/把|bǎ/午饭|wǔ fàn/还给|huán gěi/大家|dà jiā/。|",
      "If you want an apple, first return everyone's lunches."
    ]
  ],
  "creatures": [
    [
      "我们|wǒ men/要|yào/找|zhǎo/一只|yì zhī/黄色|huáng sè/的|de/狐狸|hú li/，|/不是|bú shì/蓝色|lán sè/的|de/。|",
      "We want to find a yellow fox, not a blue one."
    ],
    [
      "这个|zhè ge/对手|duì shǒu/不怕|bú pà/水|shuǐ/，|/但是|dàn shì/闪电|shǎn diàn/是|shì/它|tā/的|de/弱点|ruò diǎn/。|",
      "This opponent is not afraid of water, but lightning is its weakness."
    ],
    [
      "小狐狸|xiǎo hú li/已经|yǐ jīng/很|hěn/累|lèi/了|le/，|/需要|xū yào/休息|xiū xi/，|/不能|bù néng/再|zài/战斗|zhàn dòu/。|",
      "The little fox is already very tired. It needs rest and cannot battle again."
    ],
    [
      "先|xiān/保护|bǎo hù/门|mén/后面|hòu miàn/的|de/小鸟|xiǎo niǎo/，|/再|zài/想办法|xiǎng bàn fǎ/打开|dǎ kāi/门|mén/。|",
      "First protect the little bird behind the gate, then find a way to open it."
    ]
  ],
  "soccer": [
    [
      "队友|duì yǒu/已经|yǐ jīng/跑到|pǎo dào/前面|qián miàn/了|le/，|/你|nǐ/要|yào/留在|liú zài/后面|hòu miàn/保护|bǎo hù/球门|qiú mén/。|",
      "Your teammate has already run forward; you need to stay back and protect the goal."
    ],
    [
      "对手|duì shǒu/在|zài/你|nǐ/前面|qián miàn/，|/不要|bú yào/带球|dài qiú/，|/把|bǎ/球|qiú/传给|chuán gěi/右边|yòu biān/的|de/队友|duì yǒu/。|",
      "The opponent is in front of you. Don't dribble; pass to the teammate on your right."
    ],
    [
      "因为|yīn wèi/对手|duì shǒu/正在|zhèng zài/跑向|pǎo xiàng/球门|qiú mén/，|/所以|suǒ yǐ/你|nǐ/要|yào/先|xiān/回防|huí fáng/，|/再|zài/帮助|bāng zhù/队友|duì yǒu/。|",
      "Because the opponent is running toward goal, recover on defense first, then help your teammate."
    ],
    [
      "如果|rú guǒ/不能|bù néng/射门|shè mén/，|/就|jiù/把|bǎ/球|qiú/传给|chuán gěi/有|yǒu/机会|jī huì/的|de/队友|duì yǒu/。|",
      "If you cannot shoot, pass to a teammate who has a chance."
    ]
  ]
};
