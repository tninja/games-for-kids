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
    "subtitle": "The stolen moon lantern",
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
      ],
      [
        "The singing egg",
        "🎵",
        "At midnight the egg sings so loudly that the castle windows dance. A message appears: the moon lantern has vanished! Noodle follows a glowing feather to two paths.",
        "走|zǒu/小路|xiǎo lù/。|",
        "Take the small path",
        [
          [
            "走|zǒu/小路|xiǎo lù",
            "Take the small path",
            "The feather glows and leads toward the mountain.",
            true
          ],
          [
            "走|zǒu/大路|dà lù",
            "Take the main road",
            "A guard asks Noodle for a driver's license.",
            false
          ]
        ]
      ],
      [
        "The cold ice dragon",
        "🧣",
        "An ice dragon shivers under seven blankets. ‘I am a dragon, not a refrigerator!’ She saw the thief fly past.",
        "我|wǒ/要|yào/热水|rè shuǐ/。|",
        "I want hot water",
        [
          [
            "给|gěi/她|tā/冰水|bīng shuǐ",
            "Give her ice water",
            "She adds an eighth blanket.",
            false
          ],
          [
            "给|gěi/她|tā/热水|rè shuǐ",
            "Give her hot water",
            "She warms up and reveals a secret tunnel.",
            true
          ]
        ]
      ],
      [
        "Three tunnels",
        "🪶",
        "The feather floats above three tunnels. A talking sign whispers a direction. Noodle puts on a very small detective hat.",
        "走|zǒu/中间|zhōng jiān/。|",
        "Go through the middle",
        [
          [
            "走|zǒu/中间|zhōng jiān",
            "Go through the middle",
            "A passage opens into a cloud palace.",
            true
          ],
          [
            "走|zǒu/左边|zuǒ biān",
            "Go left",
            "A stone wall gives Noodle a very firm handshake.",
            false
          ]
        ]
      ],
      [
        "Dragon in a jar",
        "☁️",
        "A tiny cloud dragon is trapped in a jar. ‘I have never met a dragon in a pickle jar,’ says Noodle.",
        "打开|dǎ kāi/盖子|gài zi/。|",
        "Open the lid",
        [
          [
            "关上|guān shàng/盖子|gài zi",
            "Close the lid",
            "The dragon draws an unhappy face in the fog.",
            false
          ],
          [
            "打开|dǎ kāi/盖子|gài zi",
            "Open the lid",
            "The freed dragon gives you a cloud compass pointing to a secret library.",
            true
          ]
        ]
      ],
      [
        "Upside-down library",
        "📚",
        "The librarian insists books are best read upside down. Noodle tries and falls off a chair. A magic map is hidden in a book.",
        "找|zhǎo/蓝色|lán sè/的|de/书|shū/。|",
        "Find the blue book",
        [
          [
            "找|zhǎo/蓝色|lán sè/的|de/书|shū",
            "Find the blue book",
            "The map unfolds into a paper staircase to a tower.",
            true
          ],
          [
            "找|zhǎo/红色|hóng sè/的|de/书|shū",
            "Find the red book",
            "Why did the dragon cross the road? It couldn't fly with its mouth full!",
            false
          ]
        ]
      ],
      [
        "Tower of shadows",
        "🗼",
        "A shadow dragon guards a dark tower. It will help if you light the working lamp. Something inside the tower is crying.",
        "点亮|diǎn liàng/左边|zuǒ biān/的|de/灯|dēng/。|",
        "Light the left lamp",
        [
          [
            "点亮|diǎn liàng/右边|yòu biān/的|de/灯|dēng",
            "Light the right lamp",
            "The broken lamp makes a sad squeak.",
            false
          ],
          [
            "点亮|diǎn liàng/左边|zuǒ biān/的|de/灯|dēng",
            "Light the left lamp",
            "A frightened baby bird appears holding the missing lantern.",
            true
          ]
        ]
      ],
      [
        "The little thief",
        "🐦",
        "The bird took the lantern because its nest was dark. Noodle wants to help, not fight.",
        "帮|bāng/小鸟|xiǎo niǎo/。|",
        "Help the little bird",
        [
          [
            "帮|bāng/小鸟|xiǎo niǎo",
            "Help the little bird",
            "You make a glowing nest light. The bird returns the lantern.",
            true
          ],
          [
            "赶走|gǎn zǒu/小鸟|xiǎo niǎo",
            "Chase away the bird",
            "It hides behind its wings.",
            false
          ]
        ]
      ],
      [
        "Moon festival",
        "🏮",
        "The queen invites everyone to a festival. Noodle has baked a cake shaped like a potato. One last task will bring back the moonlight.",
        "把|bǎ/灯|dēng/放在|fàng zài/塔上|tǎ shàng/。|",
        "Put the lamp on the tower",
        [
          [
            "先|xiān/吃|chī/蛋糕|dàn gāo",
            "Eat cake first",
            "Noodle says, ‘Tempting, but the sky is still dark.’",
            false
          ],
          [
            "把|bǎ/灯|dēng/放在|fàng zài/塔上|tǎ shàng",
            "Put the lamp on the tower",
            "Moonlight returns! You become Guardian of the Moon.",
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
    "subtitle": "The runaway school bell",
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
      ],
      [
        "A new case",
        "📓",
        "Your notebook writes by itself: THE SCHOOL BELL IS MISSING. Pip suspects the math teacher because she likes homework. A crumb-covered note points to a room.",
        "去|qù/厨房|chú fáng/。|",
        "Go to the kitchen",
        [
          [
            "去|qù/厨房|chú fáng",
            "Go to the kitchen",
            "Crumbs lead to a talking refrigerator.",
            true
          ],
          [
            "去|qù/教室|jiào shì",
            "Go to the classroom",
            "The teacher hands Pip a worksheet. He screams silently.",
            false
          ]
        ]
      ],
      [
        "Talking fridge",
        "🧊",
        "The fridge promises a clue if you fill its empty shelf. It complains that somebody stole its breakfast.",
        "我|wǒ/要|yào/牛奶|niú nǎi/。|",
        "I want milk",
        [
          [
            "给|gěi/它|tā/袜子|wà zi",
            "Give it socks",
            "‘I am a fridge, not a washing machine!’",
            false
          ],
          [
            "给|gěi/它|tā/牛奶|niú nǎi",
            "Give it milk",
            "The fridge saw the bell roll away on two feet.",
            true
          ]
        ]
      ],
      [
        "Triangle footprints",
        "👣",
        "Strange footprints lead to two doors. Pip tries to measure them with a banana. Your notebook offers a clue.",
        "找|zhǎo/三角形|sān jiǎo xíng/的|de/门|mén/。|",
        "Find the triangle door",
        [
          [
            "找|zhǎo/三角形|sān jiǎo xíng/的|de/门|mén",
            "Find the triangle door",
            "You discover a monster clubhouse.",
            true
          ],
          [
            "找|zhǎo/圆形|yuán xíng/的|de/门|mén",
            "Find the circle door",
            "Round cookies roll out.",
            false
          ]
        ]
      ],
      [
        "The sneeze monster",
        "🤧",
        "A sneeze monster guards a box. Each sneeze sends Pip's hat flying. It asks for help.",
        "给|gěi/它|tā/纸巾|zhǐ jīn/。|",
        "Give it a tissue",
        [
          [
            "给|gěi/它|tā/胡椒|hú jiāo",
            "Give it pepper",
            "ACHOO! Pip's hat lands on a ceiling fan.",
            false
          ],
          [
            "给|gěi/它|tā/纸巾|zhǐ jīn",
            "Give it a tissue",
            "It gives you a magnifying glass and a key to a secret elevator.",
            true
          ]
        ]
      ],
      [
        "Underground party",
        "🍜",
        "Below the school, monsters are setting up a concert. The bell is hiding near a table.",
        "铃|líng/在|zài/桌子|zhuō zi/上面|shàng miàn/。|",
        "The bell is on the table",
        [
          [
            "看|kàn/桌子|zhuō zi/上面|shàng miàn",
            "Look on the table",
            "A bell with tiny feet waves hello.",
            true
          ],
          [
            "看|kàn/桌子|zhuō zi/下面|xià miàn",
            "Look under the table",
            "A spider asks if you have a reservation.",
            false
          ]
        ]
      ],
      [
        "The bell's secret",
        "🔔",
        "The bell ran away because it wants to perform music instead of ringing all day. It has written its own song.",
        "我|wǒ/想|xiǎng/唱歌|chàng gē/。|",
        "I want to sing",
        [
          [
            "让|ràng/它|tā/睡觉|shuì jiào",
            "Let it sleep",
            "It says it isn't sleepy.",
            false
          ],
          [
            "让|ràng/它|tā/唱歌|chàng gē",
            "Let it sing",
            "The bell sings beautifully. Even Pip stops talking.",
            true
          ]
        ]
      ],
      [
        "A messy party",
        "🎈",
        "The principal is coming. The cake monster has eaten all the plates. The bell offers to return if you help tidy up.",
        "先|xiān/收拾|shōu shi/桌子|zhuō zi/。|",
        "Clean the tables first",
        [
          [
            "先|xiān/收拾|shōu shi/桌子|zhuō zi",
            "Clean the tables first",
            "Everyone helps; the cake monster returns the plates, washed.",
            true
          ],
          [
            "先|xiān/回家|huí jiā",
            "Go home first",
            "Pip points at a mountain of crumbs.",
            false
          ]
        ]
      ],
      [
        "The Friday concert",
        "🎤",
        "The principal loves the monster band and invites it to play every Friday. The bell finishes its first official song.",
        "请|qǐng/大家|dà jiā/鼓掌|gǔ zhǎng/。|",
        "Everyone, please clap",
        [
          [
            "请|qǐng/大家|dà jiā/睡觉|shuì jiào",
            "Everyone, please sleep",
            "Pip asks if you are secretly the nap monster.",
            false
          ],
          [
            "鼓掌|gǔ zhǎng",
            "Clap",
            "The principal stamps your notebook: Master Monster Detective!",
            true
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
    "subtitle": "The Mountain League",
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
      ],
      [
        "A missing spark",
        "⚡",
        "Thunder Fox's tail stops glowing. The Mountain League's power crystal is missing! You set out before the tournament.",
        "去|qù/山上|shān shàng/。|",
        "Go up the mountain",
        [
          [
            "去|qù/山上|shān shàng",
            "Go up the mountain",
            "You meet a moss turtle who knows the way.",
            true
          ],
          [
            "去|qù/海边|hǎi biān",
            "Go to the beach",
            "Thunder Fox builds a sandcastle.",
            false
          ]
        ]
      ],
      [
        "Hungry turtle",
        "🐢",
        "Moss Turtle will not move until lunch. Its belly sounds like a tiny drum.",
        "我|wǒ/想|xiǎng/吃|chī/菜|cài/。|",
        "I want vegetables",
        [
          [
            "给|gěi/它|tā/肉|ròu",
            "Give it meat",
            "It shakes its head politely.",
            false
          ],
          [
            "给|gěi/它|tā/菜|cài",
            "Give it vegetables",
            "Moss Turtle joins your team.",
            true
          ]
        ]
      ],
      [
        "Rock challenge",
        "🪨",
        "A rock creature challenges you to a friendly match before opening the cave. Moss Turtle knows its weakness.",
        "它|tā/怕|pà/水|shuǐ/。|",
        "It is weak against water",
        [
          [
            "用|yòng/水|shuǐ",
            "Use water",
            "Moss Turtle wins the practice match and the cave opens.",
            true
          ],
          [
            "用|yòng/火|huǒ",
            "Use fire",
            "It warms its feet and thanks you.",
            false
          ]
        ]
      ],
      [
        "Crystal cave",
        "💎",
        "Crystals float over a pool. Thunder Fox's tail points at one, but its light is too weak to see clearly.",
        "拿|ná/绿色|lǜ sè/的|de/水晶|shuǐ jīng/。|",
        "Take the green crystal",
        [
          [
            "拿|ná/红色|hóng sè/的|de/水晶|shuǐ jīng",
            "Take the red crystal",
            "It smells like toast.",
            false
          ],
          [
            "拿|ná/绿色|lǜ sè/的|de/水晶|shuǐ jīng",
            "Take the green crystal",
            "Thunder Fox learns Spark Shield, and the team heads to the league.",
            true
          ]
        ]
      ],
      [
        "Tournament sign-up",
        "🏟️",
        "The referee is a tiny bird with an enormous whistle. Thunder Fox cannot wait for the first match.",
        "先|xiān/报名|bào míng/。|",
        "Sign up first",
        [
          [
            "先|xiān/报名|bào míng",
            "Sign up first",
            "You receive a league badge and enter the arena.",
            true
          ],
          [
            "先|xiān/比赛|bǐ sài",
            "Compete first",
            "The referee blows her whistle so hard she spins.",
            false
          ]
        ]
      ],
      [
        "Spark Shield",
        "🛡️",
        "A wind creature prepares a strong attack. Thunder Fox can use its new skill, but timing matters.",
        "先|xiān/保护|bǎo hù/自己|zì jǐ/。|",
        "Protect yourself first",
        [
          [
            "先|xiān/攻击|gōng jī",
            "Attack first",
            "The wind creature blocks the attack.",
            false
          ],
          [
            "先|xiān/保护|bǎo hù/自己|zì jǐ",
            "Protect yourself first",
            "Spark Shield holds, and Thunder Fox wins the round.",
            true
          ]
        ]
      ],
      [
        "The final challenger",
        "🐉",
        "A baby dragon's wings are tangled in a ribbon. The referee pauses the match. It looks embarrassed.",
        "帮助|bāng zhù/小龙|xiǎo lóng/。|",
        "Help the little dragon",
        [
          [
            "帮助|bāng zhù/小龙|xiǎo lóng",
            "Help the little dragon",
            "You free its wings and have a fair final match.",
            true
          ],
          [
            "继续|jì xù/攻击|gōng jī",
            "Keep attacking",
            "The referee reminds you that the match is paused.",
            false
          ]
        ]
      ],
      [
        "Friendship champions",
        "🏆",
        "Both teams shake paws after the match. Moss Turtle has fallen asleep inside the trophy. The referee invites everyone to celebrate.",
        "和|hé/朋友|péng you/一起|yì qǐ/庆祝|qìng zhù/。|",
        "Celebrate with friends",
        [
          [
            "自己|zì jǐ/回家|huí jiā",
            "Go home alone",
            "Your companions ask you to stay for a group photo.",
            false
          ],
          [
            "和|hé/朋友|péng you/一起|yì qǐ/庆祝|qìng zhù",
            "Celebrate with friends",
            "Thunder Fox evolves into radiant Storm Fox!",
            true
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
    "subtitle": "The Mountain Youth League",
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
      ],
      [
        "A new league",
        "✉️",
        "Your team is invited to the Mountain Youth League. The mascot packs twelve bananas and no shoes. At practice, the coach calls:",
        "先|xiān/热身|rè shēn/。|",
        "Warm up first",
        [
          [
            "先|xiān/热身|rè shēn",
            "Warm up first",
            "You lead the warm-up and earn the captain's trust.",
            true
          ],
          [
            "先|xiān/射门|shè mén",
            "Shoot first",
            "The coach puts away the balls until warm-up is done.",
            false
          ]
        ]
      ],
      [
        "Fast winger",
        "🏃",
        "A fast winger runs at you. You are the left back. Your coach wants you to delay the attacker and protect the middle.",
        "不要|bú yào/冲|chōng/上去|shàng qu/。|",
        "Don't rush in",
        [
          [
            "冲|chōng/上去|shàng qu",
            "Rush in",
            "The winger goes around you. Try staying balanced.",
            false
          ],
          [
            "慢慢|màn màn/后退|hòu tuì",
            "Back off carefully",
            "You stay balanced and delay the winger.",
            true
          ]
        ]
      ],
      [
        "Keeper's pass",
        "🧤",
        "Your keeper has the ball. An opponent is marking you closely. Find a safe passing lane.",
        "去|qù/空地|kòng dì/。|",
        "Move into open space",
        [
          [
            "去|qù/空地|kòng dì",
            "Move into open space",
            "The keeper passes safely to you; you break the press.",
            true
          ],
          [
            "站着|zhàn zhe/不动|bú dòng",
            "Stand still",
            "The striker stays close and the keeper waits.",
            false
          ]
        ]
      ],
      [
        "A teammate's mistake",
        "🤝",
        "A teammate misses your pass and looks upset. Your coach explains what a captain does.",
        "鼓励|gǔ lì/队友|duì yǒu/。|",
        "Encourage your teammate",
        [
          [
            "批评|pī píng/队友|duì yǒu",
            "Criticize your teammate",
            "He looks more nervous. Help him recover.",
            false
          ],
          [
            "鼓励|gǔ lì/队友|duì yǒu",
            "Encourage your teammate",
            "He smiles and plays a great pass. You earn the captain's armband.",
            true
          ]
        ]
      ],
      [
        "Corner kick",
        "🚩",
        "In the semifinal, a tall striker waits near your goal as the opponent takes a corner. The coach points to the danger.",
        "保护|bǎo hù/中间|zhōng jiān/。|",
        "Protect the middle",
        [
          [
            "保护|bǎo hù/中间|zhōng jiān",
            "Protect the middle",
            "You intercept the cross and start a counterattack.",
            true
          ],
          [
            "跑向|pǎo xiàng/角旗|jiǎo qí",
            "Run toward the corner flag",
            "The striker is left open.",
            false
          ]
        ]
      ],
      [
        "Rain game",
        "🌧️",
        "The final begins in heavy rain. The field is slippery and a teammate is open nearby. The coach wants a safe pass.",
        "传|chuán/短球|duǎn qiú/。|",
        "Play a short pass",
        [
          [
            "自己|zì jǐ/带球|dài qiú",
            "Dribble yourself",
            "You slip, but the game rewinds.",
            false
          ],
          [
            "传|chuán/短球|duǎn qiú",
            "Play a short pass",
            "Your teammate receives the ball cleanly and starts an attack.",
            true
          ]
        ]
      ],
      [
        "One last recovery",
        "⏱️",
        "The score is tied. Your team loses the ball and a striker sprints toward your goal. You are the nearest defender.",
        "快|kuài/回防|huí fáng/。|",
        "Recover quickly",
        [
          [
            "快|kuài/回防|huí fáng",
            "Recover quickly",
            "You cut off the passing lane and win possession.",
            true
          ],
          [
            "留在|liú zài/前面|qián miàn",
            "Stay forward",
            "Your keeper faces a striker alone.",
            false
          ]
        ]
      ],
      [
        "The captain's pass",
        "🥅",
        "Two opponents close you down in the last minute. A teammate runs into open space. The crowd goes quiet.",
        "传给|chuán gěi/队友|duì yǒu/。|",
        "Pass to your teammate",
        [
          [
            "自己|zì jǐ/射门|shè mén",
            "Shoot yourself",
            "Two defenders block your shot.",
            false
          ],
          [
            "传给|chuán gěi/队友|duì yǒu",
            "Pass to your teammate",
            "GOAL! Your team wins the league. The mascot finally finds its shoes.",
            true
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
    ],
    [
      "大路|dà lù/上|shàng/有人|yǒu rén/，|/我们|wǒ men/走|zǒu/小路|xiǎo lù/吧|ba/。|",
      "People are on the main road; let's take the small path."
    ],
    [
      "我|wǒ/很|hěn/冷|lěng/，|/请|qǐng/给|gěi/我|wǒ/一杯|yì bēi/热水|rè shuǐ/。|",
      "I am cold; please give me a cup of hot water."
    ],
    [
      "左边|zuǒ biān/没有|méi yǒu/路|lù/，|/请|qǐng/走|zǒu/中间|zhōng jiān/。|",
      "There is no path on the left; go through the middle."
    ],
    [
      "小龙|xiǎo lóng/出不来|chū bu lái/，|/请|qǐng/帮|bāng/它|tā/打开|dǎ kāi/盖子|gài zi/。|",
      "The little dragon cannot get out; help it open the lid."
    ],
    [
      "红色|hóng sè/的|de/书|shū/是|shì/笑话|xiào hua/，|/蓝色|lán sè/的|de/书|shū/里|lǐ/有|yǒu/地图|dì tú/。|",
      "The red book contains jokes; the blue book has a map."
    ],
    [
      "右边|yòu biān/的|de/灯|dēng/坏|huài/了|le/，|/请|qǐng/点亮|diǎn liàng/左边|zuǒ biān/的|de/灯|dēng/。|",
      "The right lamp is broken; light the left lamp."
    ],
    [
      "小鸟|xiǎo niǎo/怕|pà/黑|hēi/，|/我们|wǒ men/帮|bāng/它|tā/做|zuò/一盏|yì zhǎn/灯|dēng/吧|ba/。|",
      "The bird is afraid of the dark; let's make it a lamp."
    ],
    [
      "先|xiān/把|bǎ/灯|dēng/放在|fàng zài/塔上|tǎ shàng/，|/再|zài/和|hé/朋友|péng you/吃|chī/蛋糕|dàn gāo/。|",
      "Put the lamp on the tower first, then eat cake with friends."
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
    ],
    [
      "第一|dì yī/个|ge/线索|xiàn suǒ/在|zài/厨房|chú fáng/，|/不在|bú zài/教室|jiào shì/。|",
      "The first clue is in the kitchen, not the classroom."
    ],
    [
      "冰箱|bīng xiāng/里|lǐ/没有|méi yǒu/牛奶|niú nǎi/了|le/，|/请|qǐng/给|gěi/我|wǒ/牛奶|niú nǎi/。|",
      "There is no milk in the fridge; please give me milk."
    ],
    [
      "地上|dì shàng/的|de/脚印|jiǎo yìn/是|shì/三角形|sān jiǎo xíng/，|/所以|suǒ yǐ/要|yào/找|zhǎo/三角形|sān jiǎo xíng/的|de/门|mén/。|",
      "The footprints are triangles, so find the triangle door."
    ],
    [
      "它|tā/一直|yì zhí/打喷嚏|dǎ pēn tì/，|/需要|xū yào/一张|yì zhāng/纸巾|zhǐ jīn/。|",
      "It keeps sneezing and needs a tissue."
    ],
    [
      "铃|líng/不在|bú zài/桌子|zhuō zi/下面|xià miàn/，|/而是|ér shì/在|zài/桌子|zhuō zi/上面|shàng miàn/。|",
      "The bell is not under the table, but on it."
    ],
    [
      "我|wǒ/每天|měi tiān/都|dōu/响|xiǎng/，|/今天|jīn tiān/只|zhǐ/想|xiǎng/唱|chàng/一首|yì shǒu/歌|gē/。|",
      "I ring every day; today I just want to sing a song."
    ],
    [
      "先|xiān/收拾|shōu shi/桌子|zhuō zi/，|/再|zài/把|bǎ/铃|líng/带回|dài huí/学校|xué xiào/。|",
      "Clean the tables first, then take the bell back to school."
    ],
    [
      "铃|líng/已经|yǐ jīng/唱完|chàng wán/歌|gē/了|le/，|/请|qǐng/大家|dà jiā/一起|yì qǐ/鼓掌|gǔ zhǎng/。|",
      "The bell has finished singing; everyone, please clap together."
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
    ],
    [
      "力量|lì liàng/水晶|shuǐ jīng/在|zài/山上|shān shàng/，|/我们|wǒ men/去|qù/那里|nà lǐ/找|zhǎo/。|",
      "The power crystal is up the mountain; let's look there."
    ],
    [
      "我|wǒ/不|bù/吃|chī/肉|ròu/，|/只|zhǐ/想|xiǎng/吃|chī/绿色|lǜ sè/的|de/菜|cài/。|",
      "I don't eat meat; I only want green vegetables."
    ],
    [
      "石头|shí tou/怪|guài/不怕|bú pà/火|huǒ/，|/但是|dàn shì/怕|pà/水|shuǐ/。|",
      "The rock creature isn't afraid of fire, but is weak against water."
    ],
    [
      "红色|hóng sè/的|de/水晶|shuǐ jīng/不对|bú duì/，|/请|qǐng/拿|ná/绿色|lǜ sè/的|de/水晶|shuǐ jīng/。|",
      "The red crystal is wrong; take the green crystal."
    ],
    [
      "先|xiān/报名|bào míng/，|/再|zài/进入|jìn rù/比赛|bǐ sài/场地|chǎng dì/。|",
      "Sign up first, then enter the competition area."
    ],
    [
      "对手|duì shǒu/的|de/攻击|gōng jī/很|hěn/强|qiáng/，|/所以|suǒ yǐ/先|xiān/保护|bǎo hù/自己|zì jǐ/。|",
      "The opponent's attack is strong, so protect yourself first."
    ],
    [
      "小龙|xiǎo lóng/需要|xū yào/帮助|bāng zhù/，|/我们|wǒ men/先|xiān/帮|bāng/它|tā/，|/再|zài/比赛|bǐ sài/。|",
      "The little dragon needs help; help it first, then compete."
    ],
    [
      "不管|bù guǎn/谁|shéi/赢|yíng/了|le/，|/都|dōu/可以|kě yǐ/和|hé/朋友|péng you/一起|yì qǐ/庆祝|qìng zhù/。|",
      "Whoever wins, you can celebrate with friends."
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
    ],
    [
      "比赛|bǐ sài/还|hái/没|méi/开始|kāi shǐ/，|/大家|dà jiā/要|yào/先|xiān/热身|rè shēn/。|",
      "The match has not begun; everyone needs to warm up first."
    ],
    [
      "对手|duì shǒu/速度|sù dù/很|hěn/快|kuài/，|/不要|bú yào/急着|jí zhe/冲|chōng/上去|shàng qu/抢球|qiǎng qiú/。|",
      "The opponent is fast; don't rush in to tackle."
    ],
    [
      "对手|duì shǒu/在|zài/你|nǐ/旁边|páng biān/，|/请|qǐng/跑到|pǎo dào/没有|méi yǒu/人|rén/的|de/空地|kòng dì/。|",
      "The opponent is beside you; move into open space."
    ],
    [
      "队友|duì yǒu/刚才|gāng cái/失误|shī wù/了|le/，|/不要|bú yào/生气|shēng qì/，|/要|yào/鼓励|gǔ lì/他|tā/。|",
      "Your teammate made a mistake; don't get angry, encourage him."
    ],
    [
      "对手|duì shǒu/在|zài/球门|qiú mén/前面|qián miàn/等|děng/球|qiú/，|/你|nǐ/要|yào/保护|bǎo hù/中间|zhōng jiān/。|",
      "The opponent waits in front of goal; protect the middle."
    ],
    [
      "下雨|xià yǔ/了|le/，|/地上|dì shàng/很|hěn/滑|huá/，|/请|qǐng/传|chuán/一个|yí ge/安全|ān quán/的|de/短球|duǎn qiú/。|",
      "It's raining and the ground is slippery; play a safe short pass."
    ],
    [
      "我们|wǒ men/丢球|diū qiú/了|le/，|/对手|duì shǒu/正在|zhèng zài/进攻|jìn gōng/，|/快|kuài/回防|huí fáng/。|",
      "We lost the ball and the opponent is attacking; recover quickly."
    ],
    [
      "如果|rú guǒ/没有|méi yǒu/射门|shè mén/机会|jī huì/，|/就|jiù/把|bǎ/球|qiú/传给|chuán gěi/空位|kòng wèi/的|de/队友|duì yǒu/。|",
      "If you cannot shoot, pass to the teammate in open space."
    ]
  ]
};

export const chapterRewards: Record<string, string[]> = {
  "dragon": [
    "🥚 Moon Egg",
    "🧭 Cloud Compass",
    "🌙 Moon Guardian"
  ],
  "mystery": [
    "📓 Detective Notebook",
    "🔎 Magnifying Glass",
    "🎤 Master Detective"
  ],
  "creatures": [
    "🦊 Thunder Fox",
    "🐢 Moss Turtle",
    "⚡ Storm Fox"
  ],
  "soccer": [
    "🏆 Teamwork Cup",
    "🎽 Captain's Armband",
    "🥇 Mountain League Champion"
  ]
};
