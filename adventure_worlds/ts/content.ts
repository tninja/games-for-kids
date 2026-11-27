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
        "我|wǒ/想|xiǎng/吃|chī/苹果|píng guǒ/。|",
        "I want to eat an apple.",
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
        "钥匙|yào shi/不在|bú zài/右边|yòu biān/。|",
        "The key is not on the right.",
        [
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
          ],
          [
            "去|qù/右边|yòu biān",
            "Go right",
            "A duck asks if you are lost. It is wearing a tiny hat.",
            false
          ]
        ]
      ],
      [
        "Two doors",
        "🏰",
        "Your key opens the castle courtyard. Two colorful doors stand before you. A sign says:",
        "红门|hóng mén/后面|hòu miàn/有|yǒu/火|huǒ/。|",
        "There is fire behind the red door.",
        [
          [
            "关门|guān mén",
            "Close the door",
            "The doors are already closed. Noodle applauds your door skills.",
            false
          ],
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
          ]
        ]
      ],
      [
        "The moon egg",
        "🌙",
        "A sleepy dragon guards the moon egg. The queen leaves instructions. The guard is holding an empty cup.",
        "小龙|xiǎo lóng/很|hěn/渴|kě/。|",
        "The little dragon is very thirsty.",
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
        "大路|dà lù/不能|bù néng/走|zǒu/。|",
        "We cannot take the main road.",
        [
          [
            "走|zǒu/大路|dà lù",
            "Take the main road",
            "A guard asks Noodle for a driver's license.",
            false
          ],
          [
            "回|huí/城堡|chéng bǎo",
            "Return to the castle",
            "The singing egg insists the lantern is still missing.",
            false
          ],
          [
            "走|zǒu/小路|xiǎo lù",
            "Take the small path",
            "The feather glows and leads toward the mountain.",
            true
          ]
        ]
      ],
      [
        "The cold ice dragon",
        "🧣",
        "An ice dragon shivers under seven blankets. ‘I am a dragon, not a refrigerator!’ She saw the thief fly past.",
        "我|wǒ/冷|lěng/，|/不喝|bù hē/冷水|lěng shuǐ/。|",
        "I'm cold; I won't drink cold water.",
        [
          [
            "给|gěi/她|tā/冷茶|lěng chá",
            "Give her cold tea",
            "She wraps the cup in her seventh blanket.",
            false
          ],
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
        "左边|zuǒ biān/和|hé/右边|yòu biān/没有|méi yǒu/路|lù/。|",
        "There is no path on the left or right.",
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
          ],
          [
            "走|zǒu/右边|yòu biān",
            "Go right",
            "A sleeping bat asks for five more minutes.",
            false
          ]
        ]
      ],
      [
        "Dragon in a jar",
        "☁️",
        "A tiny cloud dragon is trapped in a jar. ‘I have never met a dragon in a pickle jar,’ says Noodle.",
        "我|wǒ/在|zài/瓶子|píng zi/里|lǐ/，|/出不来|chū bu lái/。|",
        "I'm inside the jar and can't get out.",
        [
          [
            "打开|dǎ kāi/盖子|gài zi",
            "Open the lid",
            "The freed dragon gives you a cloud compass pointing to a secret library.",
            true
          ],
          [
            "摇|yáo/瓶子|píng zi",
            "Shake the jar",
            "The cloud dragon gets dizzy and asks you to stop.",
            false
          ],
          [
            "关上|guān shàng/盖子|gài zi",
            "Close the lid",
            "The dragon draws an unhappy face in the fog.",
            false
          ]
        ]
      ],
      [
        "Upside-down library",
        "📚",
        "The librarian insists books are best read upside down. Noodle tries and falls off a chair. A magic map is hidden in a book.",
        "地图|dì tú/不在|bú zài/红书|hóng shū/里|lǐ/。|",
        "The map isn't in the red book.",
        [
          [
            "关上|guān shàng/两本|liǎng běn/书|shū",
            "Close both books",
            "The librarian says the map cannot walk out on its own.",
            false
          ],
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
        "右边|yòu biān/的|de/灯|dēng/坏|huài/了|le/。|",
        "The lamp on the right is broken.",
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
          ],
          [
            "关|guān/两盏|liǎng zhǎn/灯|dēng",
            "Turn off both lamps",
            "Noodle bumps into a chair.",
            false
          ]
        ]
      ],
      [
        "The little thief",
        "🐦",
        "The bird took the lantern because its nest was dark. Noodle wants to help, not fight.",
        "小鸟|xiǎo niǎo/怕|pà/黑|hēi/。|",
        "The little bird is afraid of the dark.",
        [
          [
            "赶走|gǎn zǒu/小鸟|xiǎo niǎo",
            "Chase away the bird",
            "It hides behind its wings.",
            false
          ],
          [
            "拿走|ná zǒu/鸟窝|niǎo wō",
            "Take away its nest",
            "That won't make its home brighter.",
            false
          ],
          [
            "帮|bāng/小鸟|xiǎo niǎo",
            "Help the little bird",
            "You make a glowing nest light. The bird returns the lantern.",
            true
          ]
        ]
      ],
      [
        "Moon festival",
        "🏮",
        "The queen invites everyone to a festival. Noodle has baked a cake shaped like a potato. One last task will bring back the moonlight.",
        "塔上|tǎ shàng/没有|méi yǒu/灯|dēng/。|",
        "There is no lamp on the tower.",
        [
          [
            "把|bǎ/灯|dēng/放在|fàng zài/桌上|zhuō shàng",
            "Put the lamp on the table",
            "It lights the cake but not the moon.",
            false
          ],
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
        "桌子|zhuō zi/下面|xià miàn/有|yǒu/声音|shēng yīn/。|",
        "There is a sound under the table.",
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
        "它|tā/怕|pà/水|shuǐ/，|/喜欢|xǐ huan/袜子|wà zi/。|",
        "It is afraid of water and likes socks.",
        [
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
          ],
          [
            "给|gěi/它|tā/水|shuǐ",
            "Offer it water",
            "It squeaks and runs away. A trail leads to the gym!",
            true
          ]
        ]
      ],
      [
        "Two lockers",
        "🔎",
        "Two lockers stand in the gym. One makes suspicious chewing noises. A note says:",
        "小门|xiǎo mén/后面|hòu miàn/有|yǒu/声音|shēng yīn/。|",
        "There is a sound behind the small door.",
        [
          [
            "开|kāi/小|xiǎo/门|mén",
            "Open the small door",
            "You find a lunch monster with a gigantic sandwich!",
            true
          ],
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
          ]
        ]
      ],
      [
        "A lunch treaty",
        "🥪",
        "The monster is just hungry. The lunch lady offers a deal.",
        "大家|dà jiā/还|hái/没|méi/吃|chī/午饭|wǔ fàn/。|",
        "Everyone still hasn't eaten lunch.",
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
        "厨房|chú fáng/里|lǐ/有|yǒu/脚印|jiǎo yìn/。|",
        "There are footprints in the kitchen.",
        [
          [
            "去|qù/教室|jiào shì",
            "Go to the classroom",
            "The teacher hands Pip a worksheet. He screams silently.",
            false
          ],
          [
            "去|qù/操场|cāo chǎng",
            "Go to the playground",
            "The swings are having a meeting without you.",
            false
          ],
          [
            "去|qù/厨房|chú fáng",
            "Go to the kitchen",
            "Crumbs lead to a talking refrigerator.",
            true
          ]
        ]
      ],
      [
        "Talking fridge",
        "🧊",
        "The fridge promises a clue if you fill its empty shelf. It complains that somebody stole its breakfast.",
        "冰箱|bīng xiāng/里|lǐ/没有|méi yǒu/牛奶|niú nǎi/。|",
        "There is no milk in the fridge.",
        [
          [
            "给|gěi/它|tā/果汁|guǒ zhī",
            "Give it juice",
            "The fridge asks for its usual white drink.",
            false
          ],
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
        "脚印|jiǎo yìn/有|yǒu/三个|sān ge/角|jiǎo/。|",
        "The footprint has three corners.",
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
          ],
          [
            "找|zhǎo/方形|fāng xíng/的|de/门|mén",
            "Find the square door",
            "A square monster complains about corners.",
            false
          ]
        ]
      ],
      [
        "The sneeze monster",
        "🤧",
        "A sneeze monster guards a box. Each sneeze sends Pip's hat flying. It asks for help.",
        "它|tā/一直|yì zhí/打喷嚏|dǎ pēn tì/。|",
        "It keeps sneezing.",
        [
          [
            "给|gěi/它|tā/纸巾|zhǐ jīn",
            "Give it a tissue",
            "It gives you a magnifying glass and a key to a secret elevator.",
            true
          ],
          [
            "给|gěi/它|tā/袜子|wà zi",
            "Give it socks",
            "It sniffs the sock and sneezes even louder.",
            false
          ],
          [
            "给|gěi/它|tā/胡椒|hú jiāo",
            "Give it pepper",
            "ACHOO! Pip's hat lands on a ceiling fan.",
            false
          ]
        ]
      ],
      [
        "Underground party",
        "🍜",
        "Below the school, monsters are setting up a concert. The bell is hiding near a table.",
        "桌子|zhuō zi/下面|xià miàn/没有|méi yǒu/铃|líng/。|",
        "The bell is not under the table.",
        [
          [
            "看|kàn/门|mén/后|hòu",
            "Look behind the door",
            "A mop wearing a tie says good evening.",
            false
          ],
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
        "我|wǒ/不想|bù xiǎng/睡觉|shuì jiào/，|/我|wǒ/喜欢|xǐ huan/音乐|yīn yuè/。|",
        "I don't want to sleep; I like music.",
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
          ],
          [
            "让|ràng/它|tā/跑步|pǎo bù",
            "Let it run",
            "It trips over its little feet.",
            false
          ]
        ]
      ],
      [
        "A messy party",
        "🎈",
        "The principal is coming. The cake monster has eaten all the plates. The bell offers to return if you help tidy up.",
        "桌子|zhuō zi/很|hěn/脏|zāng/。|",
        "The tables are very dirty.",
        [
          [
            "先|xiān/回家|huí jiā",
            "Go home first",
            "Pip points at a mountain of crumbs.",
            false
          ],
          [
            "先|xiān/吃|chī/蛋糕|dàn gāo",
            "Eat cake first",
            "The cake monster says there is none left.",
            false
          ],
          [
            "先|xiān/收拾|shōu shi/桌子|zhuō zi",
            "Clean the tables first",
            "Everyone helps; the cake monster returns the plates, washed.",
            true
          ]
        ]
      ],
      [
        "The Friday concert",
        "🎤",
        "The principal loves the monster band and invites it to play every Friday. The bell finishes its first official song.",
        "歌|gē/唱完|chàng wán/了|le/，|/大家|dà jiā/很|hěn/开心|kāi xīn/。|",
        "The song is over; everyone is happy.",
        [
          [
            "关|guān/门|mén",
            "Close the door",
            "The audience is still inside.",
            false
          ],
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
        "狐狸|hú li/是|shì/黄色|huáng sè/的|de/。|",
        "The fox is yellow.",
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
        "水|shuǐ/对|duì/它|tā/没用|méi yòng/，|/它|tā/怕|pà/闪电|shǎn diàn/。|",
        "Water doesn't work on it; it fears lightning.",
        [
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
          ],
          [
            "用|yòng/水|shuǐ",
            "Use water",
            "The water creature takes a bath. ‘Thanks!’",
            false
          ]
        ]
      ],
      [
        "A tired teammate",
        "💚",
        "The fox is tired. The healer points at a sign.",
        "小狐狸|xiǎo hú li/很|hěn/累|lèi/。|",
        "The little fox is tired.",
        [
          [
            "让|ràng/它|tā/跳|tiào",
            "Make it jump",
            "Only its ears jump.",
            false
          ],
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
          ]
        ]
      ],
      [
        "Friendship trial",
        "🏅",
        "A little bird is stuck behind a gate. Thunder Fox can open it, but the trainer gives two instructions.",
        "小鸟|xiǎo niǎo/还|hái/不安全|bù ān quán/。|",
        "The little bird is not safe yet.",
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
        "水晶|shuǐ jīng/不在|bú zài/海边|hǎi biān/，|/在|zài/山上|shān shàng/。|",
        "The crystal is not at the beach; it's on the mountain.",
        [
          [
            "去|qù/海边|hǎi biān",
            "Go to the beach",
            "Thunder Fox builds a sandcastle.",
            false
          ],
          [
            "去|qù/商店|shāng diàn",
            "Go to the shop",
            "The shop sells batteries, not magic crystals.",
            false
          ],
          [
            "去|qù/山上|shān shàng",
            "Go up the mountain",
            "You meet a moss turtle who knows the way.",
            true
          ]
        ]
      ],
      [
        "Hungry turtle",
        "🐢",
        "Moss Turtle will not move until lunch. Its belly sounds like a tiny drum.",
        "我|wǒ/不|bù/吃|chī/肉|ròu/，|/喜欢|xǐ huan/菜|cài/。|",
        "I don't eat meat; I like vegetables.",
        [
          [
            "给|gěi/它|tā/石头|shí tou",
            "Give it rocks",
            "It says, ‘I have a shell, not stone teeth.’",
            false
          ],
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
        "石头|shí tou/怪|guài/不怕|bú pà/火|huǒ/。|",
        "The rock creature isn't afraid of fire.",
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
          ],
          [
            "用|yòng/草|cǎo",
            "Use grass",
            "The rock creature happily grows a tiny garden.",
            false
          ]
        ]
      ],
      [
        "Crystal cave",
        "💎",
        "Crystals float over a pool. Thunder Fox's tail points at one, but its light is too weak to see clearly.",
        "水晶|shuǐ jīng/像|xiàng/树叶|shù yè/一样|yí yàng/绿|lǜ/。|",
        "The crystal is green like leaves.",
        [
          [
            "拿|ná/绿色|lǜ sè/的|de/水晶|shuǐ jīng",
            "Take the green crystal",
            "Thunder Fox learns Spark Shield, and the team heads to the league.",
            true
          ],
          [
            "拿|ná/蓝色|lán sè/的|de/水晶|shuǐ jīng",
            "Take the blue crystal",
            "Your hair turns blue for a second.",
            false
          ],
          [
            "拿|ná/红色|hóng sè/的|de/水晶|shuǐ jīng",
            "Take the red crystal",
            "It smells like toast.",
            false
          ]
        ]
      ],
      [
        "Tournament sign-up",
        "🏟️",
        "The referee is a tiny bird with an enormous whistle. Thunder Fox cannot wait for the first match.",
        "你的|nǐ de/名字|míng zi/不在|bú zài/名单|míng dān/上|shàng/。|",
        "Your name isn't on the list.",
        [
          [
            "先|xiān/回家|huí jiā",
            "Go home first",
            "Moss Turtle asks why you walked up a mountain.",
            false
          ],
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
        "对手|duì shǒu/要|yào/攻击|gōng jī/了|le/。|",
        "The opponent is about to attack.",
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
          ],
          [
            "先|xiān/睡觉|shuì jiào",
            "Go to sleep first",
            "The trainer reminds you this is a match, not nap time.",
            false
          ]
        ]
      ],
      [
        "The final challenger",
        "🐉",
        "A baby dragon's wings are tangled in a ribbon. The referee pauses the match. It looks embarrassed.",
        "小龙|xiǎo lóng/的|de/翅膀|chì bǎng/被|bèi/绑住|bǎng zhù/了|le/。|",
        "The little dragon's wings are tied up.",
        [
          [
            "继续|jì xù/攻击|gōng jī",
            "Keep attacking",
            "The referee reminds you that the match is paused.",
            false
          ],
          [
            "离开|lí kāi/比赛|bǐ sài",
            "Leave the match",
            "Your companions wait to see if you can help.",
            false
          ],
          [
            "帮助|bāng zhù/小龙|xiǎo lóng",
            "Help the little dragon",
            "You free its wings and have a fair final match.",
            true
          ]
        ]
      ],
      [
        "Friendship champions",
        "🏆",
        "Both teams shake paws after the match. Moss Turtle has fallen asleep inside the trophy. The referee invites everyone to celebrate.",
        "大家|dà jiā/都|dōu/赢|yíng/了|le/朋友|péng you/。|",
        "Everyone has won friends.",
        [
          [
            "藏|cáng/奖杯|jiǎng bēi",
            "Hide the trophy",
            "Moss Turtle is still inside it.",
            false
          ],
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
        "后面|hòu miàn/没人|méi rén/。|",
        "Nobody is behind.",
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
        "右边|yòu biān/有|yǒu/队友|duì yǒu/，|/前面|qián miàn/有|yǒu/对手|duì shǒu/。|",
        "A teammate is on the right; an opponent is in front.",
        [
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
          ],
          [
            "向右|xiàng yòu/传球|chuán qiú",
            "Pass right",
            "Your pass breaks the press!",
            true
          ]
        ]
      ],
      [
        "Help your teammate",
        "🛡️",
        "Your teammate is defending a fast winger. A striker is running toward your goal.",
        "对手|duì shǒu/向|xiàng/我们|wǒ men/球门|qiú mén/跑|pǎo/。|",
        "The opponent is running toward our goal.",
        [
          [
            "先|xiān/回防|huí fáng",
            "Recover on defense first",
            "You cover the striker and support your teammate.",
            true
          ],
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
          ]
        ]
      ],
      [
        "The winning move",
        "🥅",
        "It is 1–1. A defender blocks your shot. A teammate is open. The coach has a plan.",
        "你|nǐ/前面|qián miàn/有|yǒu/人|rén/，|/队友|duì yǒu/前面|qián miàn/没人|méi rén/。|",
        "Someone is in front of you; no one is in front of your teammate.",
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
        "比赛|bǐ sài/还|hái/没|méi/开始|kāi shǐ/。|",
        "The match hasn't started yet.",
        [
          [
            "先|xiān/射门|shè mén",
            "Shoot first",
            "The coach puts away the balls until warm-up is done.",
            false
          ],
          [
            "先|xiān/回家|huí jiā",
            "Go home first",
            "The mascot waves goodbye with a banana.",
            false
          ],
          [
            "先|xiān/热身|rè shēn",
            "Warm up first",
            "You lead the warm-up and earn the captain's trust.",
            true
          ]
        ]
      ],
      [
        "Fast winger",
        "🏃",
        "A fast winger runs at you. You are the left back, with your goal behind you. The coach calls from the sideline.",
        "对手|duì shǒu/跑|pǎo/得|de/很|hěn/快|kuài/。|",
        "The opponent runs very fast.",
        [
          [
            "转身|zhuǎn shēn/跑开|pǎo kāi",
            "Turn and run away",
            "The winger finds open space.",
            false
          ],
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
        "Your keeper has the ball. An opponent is marking you closely. The keeper looks your way.",
        "你|nǐ/旁边|páng biān/有|yǒu/对手|duì shǒu/。|",
        "There is an opponent beside you.",
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
          ],
          [
            "跑向|pǎo xiàng/对手|duì shǒu",
            "Run toward the opponent",
            "That crowds the passing lane.",
            false
          ]
        ]
      ],
      [
        "A teammate's mistake",
        "🤝",
        "A teammate misses your pass and looks upset. Your coach explains what a captain does.",
        "队友|duì yǒu/很|hěn/难过|nán guò/。|",
        "Your teammate is very upset.",
        [
          [
            "鼓励|gǔ lì/队友|duì yǒu",
            "Encourage your teammate",
            "He smiles and plays a great pass. You earn the captain's armband.",
            true
          ],
          [
            "不|bù/理|lǐ/他|tā",
            "Ignore him",
            "He still looks upset.",
            false
          ],
          [
            "批评|pī píng/队友|duì yǒu",
            "Criticize your teammate",
            "He looks more nervous. Help him recover.",
            false
          ]
        ]
      ],
      [
        "Corner kick",
        "🚩",
        "In the semifinal, the opponent takes a corner. Your coach points toward your penalty area.",
        "高个子|gāo gè zi/对手|duì shǒu/在|zài/球门|qiú mén/前|qián/。|",
        "The tall opponent is in front of goal.",
        [
          [
            "跑到|pǎo dào/前面|qián miàn",
            "Run forward",
            "The keeper calls you back.",
            false
          ],
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
        "The final begins in heavy rain. You receive the ball and hear the coach shout.",
        "地上|dì shàng/很|hěn/滑|huá/，|/队友|duì yǒu/很|hěn/近|jìn/。|",
        "The ground is slippery; your teammate is nearby.",
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
          ],
          [
            "踢|tī/高球|gāo qiú",
            "Kick a high ball",
            "The wind blows it toward the bench.",
            false
          ]
        ]
      ],
      [
        "One last recovery",
        "⏱️",
        "The score is tied. Your team loses the ball and a striker sprints toward your goal. You are the nearest defender.",
        "我们|wǒ men/丢球|diū qiú/了|le/，|/对手|duì shǒu/在|zài/进攻|jìn gōng/。|",
        "We lost the ball; the opponent is attacking.",
        [
          [
            "留在|liú zài/前面|qián miàn",
            "Stay forward",
            "Your keeper faces a striker alone.",
            false
          ],
          [
            "停|tíng/下来|xià lái",
            "Stop",
            "The coach points toward your goal.",
            false
          ],
          [
            "快|kuài/回防|huí fáng",
            "Recover quickly",
            "You cut off the passing lane and win possession.",
            true
          ]
        ]
      ],
      [
        "The captain's pass",
        "🥅",
        "Two opponents close you down in the last minute. A teammate runs into open space. The crowd goes quiet.",
        "两个人|liǎng ge rén/挡住|dǎng zhù/你|nǐ/，|/队友|duì yǒu/没人|méi rén/防守|fáng shǒu/。|",
        "Two people block you; your teammate is unmarked.",
        [
          [
            "把|bǎ/球|qiú/踢出|tī chū/球场|qiú chǎng",
            "Kick it out",
            "The mascot catches it with a banana.",
            false
          ],
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
      "我|wǒ/饿|è/了|le/，|/不想|bù xiǎng/吃鱼|chī yú/，|/想|xiǎng/吃|chī/一个|yí ge/苹果|píng guǒ/。|",
      "I am hungry. I don't want fish; I want an apple."
    ],
    [
      "桥|qiáo/的|de/右边|yòu biān/只有|zhǐ yǒu/水|shuǐ/，|/钥匙|yào shi/在|zài/另一边|lìng yì biān/。|",
      "There is only water on the right side of the bridge. The key is on the other side."
    ],
    [
      "红色|hóng sè/的|de/门|mén/后面|hòu miàn/很|hěn/热|rè/，|/蓝色|lán sè/的|de/门|mén/后面|hòu miàn/很|hěn/安全|ān quán/。|",
      "It is very hot behind the red door, but safe behind the blue one."
    ],
    [
      "小龙|xiǎo lóng/还|hái/没|méi/喝水|hē shuǐ/，|/它|tā/喝完|hē wán/才|cái/会|huì/让|ràng/我们|wǒ men/拿|ná/龙蛋|lóng dàn/。|",
      "The little dragon hasn't had water. Only after drinking will it let us take the egg."
    ],
    [
      "大路|dà lù/上|shàng/有|yǒu/守卫|shǒu wèi/，|/他们|tā men/不让|bú ràng/人|rén/过去|guò qu/。|",
      "There are guards on the main road; they won't let people pass."
    ],
    [
      "我|wǒ/的|de/手|shǒu/都|dōu/冻|dòng/了|le/，|/想|xiǎng/喝|hē/一点|yì diǎn/暖暖|nuǎn nuǎn/的|de/东西|dōng xi/。|",
      "My hands are frozen. I want something warm to drink."
    ],
    [
      "左边|zuǒ biān/是|shì/石墙|shí qiáng/，|/右边|yòu biān/也|yě/走|zǒu/不通|bù tōng/，|/还|hái/有|yǒu/一条|yì tiáo/路|lù/。|",
      "There is a stone wall on the left, and the right is blocked too. There is one path left."
    ],
    [
      "瓶子|píng zi/的|de/盖子|gài zi/是|shì/关着|guān zhe/的|de/，|/我|wǒ/太|tài/小|xiǎo/了|le/，|/自己|zì jǐ/出不来|chū bu lái/。|",
      "The lid is closed. I am too small to get out by myself."
    ],
    [
      "红色|hóng sè/的|de/书|shū/只有|zhǐ yǒu/笑话|xiào hua/，|/地图|dì tú/在|zài/另一本|lìng yì běn/书|shū/里|lǐ/。|",
      "The red book contains only jokes; the map is in the other book."
    ],
    [
      "右边|yòu biān/的|de/灯|dēng/没有|méi yǒu/油|yóu/，|/只有|zhǐ yǒu/另一盏|lìng yì zhǎn/灯|dēng/还|hái/能|néng/用|yòng/。|",
      "The right lamp has no oil. Only the other one still works."
    ],
    [
      "小鸟|xiǎo niǎo/拿走|ná zǒu/了|le/灯|dēng/，|/因为|yīn wèi/它|tā/的|de/家|jiā/太|tài/黑|hēi/了|le/。|",
      "The bird took the lamp because its home is too dark."
    ],
    [
      "灯|dēng/还|hái/在|zài/我们|wǒ men/手里|shǒu lǐ/，|/塔上|tǎ shàng/不亮|bú liàng/，|/月亮|yuè liang/也|yě/不亮|bú liàng/。|",
      "The lamp is still in our hands; the tower and moon are both dark."
    ]
  ],
  "mystery": [
    [
      "门|mén/后面|hòu miàn/很|hěn/安静|ān jìng/，|/桌子|zhuō zi/下面|xià miàn/有|yǒu/奇怪|qí guài/的|de/声音|shēng yīn/。|",
      "It is quiet behind the door, but there is a strange sound under the table."
    ],
    [
      "袜子|wà zi/会|huì/让|ràng/它|tā/变大|biàn dà/，|/水|shuǐ/会|huì/让|ràng/它|tā/跑开|pǎo kāi/。|",
      "Socks make it grow, while water makes it run away."
    ],
    [
      "大门|dà mén/后面|hòu miàn/只有|zhǐ yǒu/球|qiú/，|/吃东西|chī dōng xi/的|de/声音|shēng yīn/从|cóng/小门|xiǎo mén/后面|hòu miàn/传来|chuán lái/。|",
      "There are only balls behind the big door; chewing sounds come from behind the small door."
    ],
    [
      "怪兽|guài shòu/拿走|ná zǒu/了|le/大家|dà jiā/的|de/午饭|wǔ fàn/，|/它|tā/要|yào/先|xiān/道歉|dào qiàn/和|hé/还东西|huán dōng xi/。|",
      "The monster took everyone's lunches; it must apologize and return the things first."
    ],
    [
      "教室|jiào shì/没有|méi yǒu/脚印|jiǎo yìn/，|/厨房|chú fáng/的|de/地上|dì shàng/却|què/有|yǒu/奇怪|qí guài/的|de/脚印|jiǎo yìn/。|",
      "There are no footprints in the classroom, but strange footprints on the kitchen floor."
    ],
    [
      "冰箱|bīng xiāng/想|xiǎng/喝|hē/白色|bái sè/的|de/奶|nǎi/，|/但是|dàn shì/里面|lǐ miàn/空空|kōng kōng/的|de/。|",
      "The fridge wants white milk to drink, but it is empty inside."
    ],
    [
      "脚印|jiǎo yìn/有|yǒu/三条|sān tiáo/边|biān/和|hé/三个|sān ge/角|jiǎo/，|/门上|mén shàng/的|de/图形|tú xíng/和|hé/它|tā/一样|yí yàng/。|",
      "The footprint has three sides and three corners; the shape on the door matches it."
    ],
    [
      "它|tā/鼻子|bí zi/不舒服|bù shū fu/，|/要|yào/擦|cā/鼻子|bí zi/，|/不能|bù néng/再|zài/闻|wén/胡椒|hú jiāo/。|",
      "Its nose feels uncomfortable. It needs to wipe its nose and shouldn't smell pepper again."
    ],
    [
      "桌子|zhuō zi/下面|xià miàn/只有|zhǐ yǒu/一只|yì zhī/蜘蛛|zhī zhū/，|/铃|líng/和|hé/盘子|pán zi/放在|fàng zài/一起|yì qǐ/。|",
      "There is only a spider under the table; the bell is with the plates."
    ],
    [
      "我|wǒ/每天|měi tiān/都|dōu/发出|fā chū/同样|tóng yàng/的|de/声音|shēng yīn/，|/今天|jīn tiān/想|xiǎng/让|ràng/大家|dà jiā/听|tīng/我|wǒ/的|de/歌|gē/。|",
      "I make the same sound every day; today I want everyone to hear my song."
    ],
    [
      "校长|xiào zhǎng/快|kuài/来了|lái le/，|/桌上|zhuō shàng/有|yǒu/很多|hěn duō/垃圾|lā jī/，|/我们|wǒ men/还|hái/不能|bù néng/走|zǒu/。|",
      "The principal is coming soon. There is lots of trash on the tables, and we cannot leave yet."
    ],
    [
      "铃|líng/第一次|dì yī cì/在|zài/大家|dà jiā/面前|miàn qián/表演|biǎo yǎn/，|/我们|wǒ men/用|yòng/双手|shuāng shǒu/表示|biǎo shì/喜欢|xǐ huan/。|",
      "The bell performed in front of everyone for the first time; let's show our appreciation with both hands."
    ]
  ],
  "creatures": [
    [
      "会|huì/发|fā/闪电|shǎn diàn/的|de/动物|dòng wù/有|yǒu/四条|sì tiáo/腿|tuǐ/和|hé/黄色|huáng sè/的|de/尾巴|wěi ba/。|",
      "The creature that makes lightning has four legs and a yellow tail."
    ],
    [
      "对手|duì shǒu/喜欢|xǐ huan/水|shuǐ/，|/遇到|yù dào/闪电|shǎn diàn/就|jiù/会|huì/变弱|biàn ruò/。|",
      "The opponent likes water, but becomes weak when it encounters lightning."
    ],
    [
      "它|tā/刚刚|gāng gāng/打完|dǎ wán/比赛|bǐ sài/，|/现在|xiàn zài/连|lián/眼睛|yǎn jing/都|dōu/睁不开|zhēng bu kāi/。|",
      "It just finished a match and can barely open its eyes now."
    ],
    [
      "开门|kāi mén/的|de/时候|shí hou/可能|kě néng/伤到|shāng dào/小鸟|xiǎo niǎo/，|/先|xiān/让|ràng/它|tā/安全|ān quán/才|cái/行|xíng/。|",
      "Opening the gate could hurt the bird. Make it safe first."
    ],
    [
      "水晶|shuǐ jīng/在|zài/很|hěn/高|gāo/的|de/地方|dì fang/，|/那里|nà lǐ/有|yǒu/很多|hěn duō/石头|shí tou/，|/没有|méi yǒu/大海|dà hǎi/。|",
      "The crystal is high up, where there are many rocks and no sea."
    ],
    [
      "我|wǒ/的|de/午饭|wǔ fàn/要|yào/绿色|lǜ sè/的|de/叶子|yè zi/，|/不要|bú yào/肉|ròu/。|",
      "For lunch I want green leaves, not meat."
    ],
    [
      "火|huǒ/让|ràng/它|tā/觉得|jué de/暖和|nuǎn huo/，|/水|shuǐ/却|què/会|huì/让|ràng/它|tā/变弱|biàn ruò/。|",
      "Fire makes it feel warm, but water weakens it."
    ],
    [
      "我们|wǒ men/要|yào/的|de/水晶|shuǐ jīng/和|hé/春天|chūn tiān/的|de/树叶|shù yè/颜色|yán sè/一样|yí yàng/。|",
      "The crystal we need is the same color as spring leaves."
    ],
    [
      "没有|méi yǒu/名字|míng zi/的|de/队伍|duì wu/不能|bù néng/进|jìn/比赛|bǐ sài/场地|chǎng dì/。|",
      "Teams without a name on the list cannot enter the competition area."
    ],
    [
      "对手|duì shǒu/马上|mǎ shàng/要|yào/发出|fā chū/很|hěn/强|qiáng/的|de/攻击|gōng jī/，|/我们|wǒ men/要|yào/先|xiān/保证|bǎo zhèng/安全|ān quán/。|",
      "The opponent is about to make a strong attack; first ensure safety."
    ],
    [
      "小龙|xiǎo lóng/的|de/翅膀|chì bǎng/不能|bù néng/动|dòng/，|/现在|xiàn zài/和|hé/它|tā/比赛|bǐ sài/不|bù/公平|gōng píng/。|",
      "The little dragon cannot move its wings; competing now would be unfair."
    ],
    [
      "虽然|suī rán/比赛|bǐ sài/结束|jié shù/了|le/，|/但|dàn/大家|dà jiā/的|de/友情|yǒu qíng/才|cái/刚刚|gāng gāng/开始|kāi shǐ/。|",
      "Although the match is over, everyone's friendship is just beginning."
    ]
  ],
  "soccer": [
    [
      "另一个|lìng yí ge/后卫|hòu wèi/已经|yǐ jīng/向前|xiàng qián/跑|pǎo/了|le/，|/对手|duì shǒu/可能|kě néng/从|cóng/后面|hòu miàn/进攻|jìn gōng/。|",
      "The other defender has run forward. The opponent could attack from behind."
    ],
    [
      "左边|zuǒ biān/和|hé/前面|qián miàn/都|dōu/有|yǒu/对手|duì shǒu/，|/右边|yòu biān/的|de/队友|duì yǒu/没人|méi rén/防守|fáng shǒu/。|",
      "There are opponents on the left and in front. Your teammate on the right is unmarked."
    ],
    [
      "队友|duì yǒu/正在|zhèng zài/防守|fáng shǒu/边路|biān lù/，|/另一名|lìng yì míng/对手|duì shǒu/却|què/向|xiàng/我们的|wǒ men de/球门|qiú mén/跑去|pǎo qù/。|",
      "Your teammate is defending the wing, but another opponent is running toward our goal."
    ],
    [
      "对手|duì shǒu/挡住|dǎng zhù/了|le/你|nǐ/的|de/射门|shè mén/路线|lù xiàn/，|/但是|dàn shì/队友|duì yǒu/有|yǒu/很|hěn/好|hǎo/的|de/机会|jī huì/。|",
      "An opponent blocks your shooting lane, but your teammate has a good opportunity."
    ],
    [
      "队员|duì yuán/刚|gāng/到|dào/球场|qiú chǎng/，|/身体|shēn tǐ/还|hái/没|méi/准备|zhǔn bèi/好|hǎo/运动|yùn dòng/。|",
      "The players just arrived and their bodies are not ready for exercise yet."
    ],
    [
      "你|nǐ/身后|shēn hòu/有|yǒu/球门|qiú mén/，|/对手|duì shǒu/速度|sù dù/很|hěn/快|kuài/，|/太|tài/早|zǎo/抢球|qiǎng qiú/容易|róng yì/被|bèi/过|guò/。|",
      "The goal is behind you and the opponent is fast; tackling too early makes it easy to get beaten."
    ],
    [
      "守门员|shǒu mén yuán/有|yǒu/球|qiú/，|/可是|kě shì/对手|duì shǒu/离|lí/你|nǐ/太|tài/近|jìn/，|/传球|chuán qiú/不安全|bù ān quán/。|",
      "The keeper has the ball, but the opponent is too close to you for a safe pass."
    ],
    [
      "队友|duì yǒu/刚才|gāng cái/没|méi/接住|jiē zhù/球|qiú/，|/他|tā/很|hěn/难过|nán guò/，|/需要|xū yào/一点|yì diǎn/信心|xìn xīn/。|",
      "Your teammate missed the ball and feels upset; he needs some confidence."
    ],
    [
      "角球|jiǎo qiú/马上|mǎ shàng/要|yào/踢出|tī chū/，|/最高|zuì gāo/的|de/对手|duì shǒu/正在|zhèng zài/球门|qiú mén/前|qián/等|děng/球|qiú/。|",
      "The corner is about to be taken; the tallest opponent is waiting in front of goal."
    ],
    [
      "下雨|xià yǔ/以后|yǐ hòu/地上|dì shàng/很|hěn/滑|huá/，|/旁边|páng biān/的|de/队友|duì yǒu/没人|méi rén/防守|fáng shǒu/，|/远处|yuǎn chù/却|què/有|yǒu/很多|hěn duō/人|rén/。|",
      "After the rain the ground is slippery; the nearby teammate is unmarked, while far away there are many players."
    ],
    [
      "我们|wǒ men/刚刚|gāng gāng/丢球|diū qiú/，|/对手|duì shǒu/正在|zhèng zài/向|xiàng/我们|wǒ men/的|de/球门|qiú mén/跑|pǎo/，|/守门员|shǒu mén yuán/需要|xū yào/帮助|bāng zhù/。|",
      "We just lost the ball; the opponent is running toward our goal and the goalkeeper needs help."
    ],
    [
      "两个|liǎng ge/后卫|hòu wèi/挡住|dǎng zhù/你|nǐ/的|de/射门|shè mén/路线|lù xiàn/，|/可是|kě shì/空位|kòng wèi/上|shàng/的|de/队友|duì yǒu/离|lí/球门|qiú mén/很|hěn/近|jìn/。|",
      "Two defenders block your shooting lane, but your unmarked teammate is close to goal."
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

export const storyDialogue: Record<string, string[]> = {
  "dragon": [
    "Noodle: “An egg that orders breakfast? Is it going to ask for room service?” Spicy: “Don't give it my menu!”",
    "Noodle: “I can fly across, but my wings are currently on lunch break.”",
    "Noodle: “If there's a dragon behind a door, knock first. If there's a chicken, definitely knock.”",
    "Noodle: “I brought a cup! Unfortunately it is my swimming pool.”",
    "Noodle: “Maybe the guards are allergic to dragons. Or to singing eggs.”",
    "Ice dragon: “My official job title is Frozen. It is not supposed to be my personality.”",
    "Noodle: “Three tunnels, one brain. I hope the brain is yours.”",
    "Cloud dragon: “Please don't put me in the fridge. I'm not leftover soup!”",
    "Librarian: “I once read a whole book upside down. It was a book about bats.”",
    "Shadow dragon: “I'm the guardian of darkness. My electricity bill is surprisingly low.”",
    "Noodle: “Maybe the bird needs a night-light. I need one too, but don't tell the other dragons.”",
    "Queen: “The moon needs its light back.” Noodle: “And the cake needs its mouth back. Mine.”"
  ],
  "mystery": [
    "Pip: “My sandwich has been kidnapped! It didn't even leave a goodbye note.”",
    "Pip: “I found the monster's weakness. Or maybe it's just never done laundry.”",
    "Pip: “A locker eating lunch is bad. A locker eating my homework is an excellent invention.”",
    "Lunch monster: “I was just testing the sandwiches for quality. All thirty-seven of them.”",
    "Pip: “A missing bell means no homework, right?” Principal: “Nice try.”",
    "Fridge: “I'm a refrigerator. Why is my breakfast missing? I have ONE job.”",
    "Pip: “My banana ruler says the footprint is approximately one banana long.”",
    "Monster: “ACHOO!” Pip: “There goes my hat. Again.”",
    "Pip: “The spider asked me for a dinner reservation. I don't think we can afford eight seats.”",
    "Bell: “I have a beautiful singing voice.” Pip: “I have heard you at eight every morning. Prove it.”",
    "Cake monster: “I ate the plates because they're round like cookies.” Pip: “That is not a defense.”",
    "Bell: “Thank you, thank you! My next song is called No More Monday Mornings.”"
  ],
  "creatures": [
    "Trainer: “That yellow bird is definitely not a fox.” Bird: “I am trying my best.”",
    "Thunder Fox: “Can I practice my lightning on a toaster?” Trainer: “Absolutely not.”",
    "Fox: “I am not sleeping. I am practicing very advanced eye-closing.”",
    "Bird: “I would like to be rescued with all my feathers, please.”",
    "Fox: “My tail is out of battery.” Trainer: “Your tail is not a remote control.”",
    "Turtle: “I'm a very fast turtle.” Fox: “How fast?” Turtle: “Lunch first.”",
    "Rock creature: “I am rock solid!” Turtle: “That's your only joke, isn't it?”",
    "Fox: “I hope the crystal isn't spicy.” Turtle: “Please stop eating important quest items.”",
    "Referee: “Next team!” Fox: “Can our team name be The Extremely Handsome Foxes?”",
    "Fox: “Shield? I thought you said sandwich.” Turtle: “Focus!”",
    "Dragon: “I can explain the ribbon.” Fox: “Were you wrapping yourself as a birthday present?”",
    "Turtle: “This trophy is surprisingly comfortable.” Fox: “You cannot live in our award.”"
  ],
  "soccer": [
    "Coach: “We need one defender back.” Mascot: “I volunteer!” Coach: “You are a banana in a costume.”",
    "Mascot: “I can see an opening!” Coach: “That's the snack bar.”",
    "Keeper: “Hello? Anybody back here?” Mascot: “I brought oranges!”",
    "Coach: “The ball moves faster than you.” Mascot: “Not faster than me at snack time.”",
    "Mascot: “I stretched my peel.” Coach: “Very impressive. Now watch the team.”",
    "Winger: “Bet you can't catch me!” Coach: “We don't need a race; we need good defending.”",
    "Keeper: “Can you get free?” Mascot: “Free tickets? Where?”",
    "Teammate: “Sorry!” Mascot: “I once dropped an entire bowl of oranges. We all make mistakes.”",
    "Keeper: “That striker is tall.” Mascot: “I'm tall too, if I stand on six oranges.”",
    "Mascot: “I packed a raincoat.” Coach: “For yourself?” Mascot: “For my banana.”",
    "Keeper: “Not another one!” Mascot: “I would help, but my shoes are still missing.”",
    "Coach: “Make the team stronger, not just yourself.” Mascot: “Does that mean we share the oranges?”"
  ]
};
