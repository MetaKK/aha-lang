/**
 * 哈利波特A2级别多章节Quest数据
 * 沉浸式英语学习体验，符合A2级别学习者需求
 */

import type { MultiChapterQuest, Chapter } from '@/types/multi-chapter';
import type { NovelContent } from '@/lib/api/novel-mock-data';

// 哈利波特小说信息
const harryPotterNovel: NovelContent = {
  id: 'harry-potter-a2',
  title: 'Harry Potter and the Philosopher\'s Stone',
  author: 'J.K. Rowling',
  excerpt: 'Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility. All he knows is a miserable life with the Dursleys, his horrible aunt and uncle, and their abominable son, Dudley.',
  coverImage: 'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=400&h=600&fit=crop',
  difficulty: 2,
  tags: ['fantasy', 'magic', 'adventure', 'friendship'],
  language: 'English',
  estimatedTime: '45 minutes',
  chapters: [], // 空章节数组，因为我们在Quest中单独管理章节
};

// 第一章：The Boy Who Lived
const chapter1: Chapter = {
  id: 'hp-chapter-1',
  title: 'The Boy Who Lived',
  content: `Mr. and Mrs. Dursley of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.

Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.

The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere. The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it. They didn't think they could bear it if anyone found out about the Potters.

Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unDursleyish as it was possible to be. The Dursleys shuddered to think what the neighbors would say if the Potters arrived in the street. The Dursleys knew that the Potters had a small son, too, but they had never even seen him. This boy was another good reason for keeping the Potters away; they didn't want Dudley mixing with a child like that.

When Mr. and Mrs. Dursley woke up on the dull, gray Tuesday our story starts, there was nothing about the cloudy sky outside to suggest that strange and mysterious things would soon be happening all over the country. Mr. Dursley hummed as he picked out his most boring tie for work, and Mrs. Dursley gossiped away happily as she wrestled a screaming Dudley into his high chair.

None of them noticed a large, tawny owl flutter past the window.

At half past eight, Mr. Dursley picked up his briefcase, pecked Mrs. Dursley on the cheek, and tried to kiss Dudley good-bye but missed, because Dudley was now having a tantrum and throwing his cereal at the walls. "Little tyke," chortled Mr. Dursley as he left the house. He got into his car and backed out of number four's drive.

It was on the corner of the street that he noticed the first sign of something peculiar — a cat reading a map. For a second, Mr. Dursley didn't realize what he had seen — then he jerked his head around to look again. There was a tabby cat standing on the corner of Privet Drive, but there wasn't a map in sight. What could he have been thinking of? It must have been a trick of the light.

Mr. Dursley blinked and stared at the cat. It stared back. As Mr. Dursley drove around the corner and up the road, he watched the cat in his mirror. It was now reading the sign that said Privet Drive — no, looking at the sign; cats couldn't read maps or signs. Mr. Dursley gave himself a little shake and put the cat out of his mind. As he drove toward town he thought of nothing except a large order of drills he was hoping to get that day.

But on the edge of town, drills were driven out of his mind by something else. As he sat in the usual morning traffic jam, he couldn't help noticing that there seemed to be a lot of strangely dressed people about. People in cloaks. Mr. Dursley couldn't bear people who dressed in funny clothes — the getups you saw on young people! He supposed this was some stupid new fashion. He drummed his fingers on the steering wheel and his eyes fell on a huddle of these weirdos standing quite close by. They were whispering excitedly together. Mr. Dursley was enraged to see that a couple of them weren't young at all; why, that man had to be older than he was, and wearing an emerald-green cloak! The nerve of him! But then it struck Mr. Dursley that this was probably some silly stunt — these people were obviously collecting for something... yes, that would be it. The traffic moved on and a few minutes later, Mr. Dursley arrived in the Grunnings parking lot, his mind back on drills.

Mr. Dursley always sat with his back to the window in his office on the ninth floor. If he hadn't, he might have found it harder to concentrate on drills that morning. He didn't see the owls swooping past in broad daylight, though people down in the street did; they pointed and gazed open-mouthed as owl after owl sped overhead. Most of them had never seen an owl even at nighttime. Mr. Dursley, however, had a perfectly normal, owl-free morning. He yelled at five different people. He made several important telephone calls and shouted a bit more. He was in a very good mood until lunchtime, when he thought he'd stretch his legs and walk across the road to buy himself a bun from the bakery.

He'd forgotten all about the people in cloaks until he passed a group of them next to the baker's. He eyed them angrily as he passed. He didn't know why, but they made him uneasy. This lot were whispering excitedly, too, and he couldn't see a single collecting tin. It was on his way back past them, clutching a large doughnut in a bag, that he caught a few words of what they were saying.

"The Potters, that's right, that's what I heard —"

"— yes, their son, Harry —"

Mr. Dursley stopped dead. Fear flooded him. He looked back at the whisperers as if he wanted to say something to them, but thought better of it.

He dashed back across the road, hurried up to his office, snapped at his secretary not to disturb him, seized his telephone, and had almost finished dialing his home number when he changed his mind. He put the receiver back down and stroked his mustache, thinking... no, he was being stupid. Potter wasn't such an unusual name. He was sure there were lots of people called Potter who had a son called Harry. Come to think of it, he wasn't even sure his nephew was called Harry. He'd never even seen the boy. It might have been Harvey. Or Harold. There was no point in worrying Mrs. Dursley; she always got so upset at the mention of her sister. He didn't blame her — if he'd had a sister like that... but all the same, those people in cloaks...

He found it a lot harder to concentrate on drills that afternoon and when he left the building at five o'clock, he was still so worried that he walked straight into someone just outside the door.

"Sorry," he grunted, as the tiny old man stumbled and almost fell. It was a few seconds before Mr. Dursley realized that the man was wearing a violet cloak. He didn't seem at all upset at being almost knocked to the ground. On the contrary, his face split into a wide smile and he said in a squeaky voice that made passersby stare, "Don't be sorry, my dear sir, for nothing could upset me today! Rejoice, for You-Know-Who has gone at last! Even Muggles like yourself should be celebrating, this happy, happy day!"

And the old man hugged Mr. Dursley around the middle and walked off.

Mr. Dursley stood rooted to the spot. He had been hugged by a complete stranger. He also thought he had been called a Muggle, whatever that was. He was rattled. He hurried to his car and set off for home, hoping he was imagining things, which he had never hoped before, because he didn't approve of imagination.

As he pulled into the driveway of number four, the first thing he saw — and it didn't improve his mood — was the tabby cat he'd spotted that morning. It was now sitting on his garden wall. Was it the same cat? He was sure it was the same one that had been reading the map, but this cat didn't have a map. He was sure it was the same one, though.

"Scat!" said Mr. Dursley loudly.

The cat didn't move. It just gave him a stern look. Was this normal cat behavior? Mr. Dursley wasn't sure. He was trying to pull himself together. He was still in shock. He went inside and was still in shock when he sat down at the dinner table that evening.`,
  scene: {
    title: 'Meeting the Dursleys',
    description: 'You are Harry Potter, arriving at the Dursleys\' house for the first time',
    context: 'You are a baby Harry Potter, just left on the doorstep of number four, Privet Drive. The Dursleys are your only living relatives, but they don\'t know about magic. You need to introduce yourself and explain why you\'re there.',
    goal: 'Introduce yourself to the Dursleys and explain your situation in simple English',
    difficulty: 'A2',
  },
  order: 1,
  isCompleted: false,
};

// 第二章：The Vanishing Glass
const chapter2: Chapter = {
  id: 'hp-chapter-2',
  title: 'The Vanishing Glass',
  content: `Nearly ten years had passed since the Dursleys had woken up to find their nephew on the front step, but Privet Drive had hardly changed at all. The sun rose on the same tidy front gardens and lit up the brass number four on the Dursleys' front door; it crept into their living room, which was almost exactly the same as it had been the night before. The only thing that was different about the morning was the fact that the Dursleys were celebrating Dudley's birthday.

Harry Potter was sitting on the floor of his cupboard under the stairs, trying to make himself as small as possible. He was wearing a pair of Dudley's old clothes, which were much too big for him, and he was trying to read a book by the light of a single candle. The book was about a boy who lived in a cupboard under the stairs, just like Harry, but this boy was a wizard and went to a school for magic. Harry had read this book so many times that he knew it by heart, but he still loved it.

Harry was small and skinny for his age, with untidy black hair and bright green eyes. He wore round glasses held together with tape, and he had a thin scar on his forehead that was shaped like a lightning bolt. The Dursleys had told him that he had gotten it in a car crash when he was a baby, but Harry had a feeling that wasn't quite right.

The Dursleys had never told Harry about his parents. They had told him that they had died in a car crash, but Harry suspected that wasn't true either. He had found a photograph of them once, hidden in the attic. They looked like nice people, and Harry wished he could have known them.

"Harry! Get up! Dudley's birthday breakfast is ready!" Aunt Petunia's voice echoed down the stairs.

Harry quickly hid his book under his pillow and got up. He had learned that it was best to do what the Dursleys said, when they said it. He climbed out of his cupboard and made his way to the kitchen.

The kitchen was full of presents for Dudley. There were so many that Harry couldn't even count them all. Dudley was sitting at the table, already eating his breakfast, which consisted of bacon, eggs, toast, and orange juice. Harry's breakfast was a piece of dry toast and a glass of water.

"Happy birthday, Dudley," Harry said quietly.

Dudley didn't even look up from his food. "Thanks," he muttered, his mouth full.

"Now, Harry," Uncle Vernon said, looking up from his newspaper, "today is Dudley's special day, so you will be extra helpful and quiet. Is that understood?"

"Yes, Uncle Vernon," Harry said.

"Good. Now, Dudley, how many presents do you have this year?" Uncle Vernon asked.

Dudley counted quickly. "Thirty-six," he said proudly.

"Thirty-six! That's two more than last year!" Uncle Vernon said, beaming.

Harry looked at his own presents. He had two: a pair of old socks from Aunt Petunia and a used handkerchief from Uncle Vernon. He didn't mind, though. He was used to it.

After breakfast, Dudley opened all his presents. He got everything he wanted: a new bicycle, a computer, a television, and dozens of other expensive toys. Harry watched quietly from the corner, trying to stay out of the way.

When Dudley had finished opening his presents, he looked around the room. "I don't like this one," he said, pointing to a small toy car. "It's too small."

"Don't worry, Dudders," Uncle Vernon said. "We'll get you a bigger one tomorrow."

Dudley smiled. "And I want a new computer game too."

"Of course, son," Uncle Vernon said. "Whatever you want."

Harry sighed. He knew that Dudley would get everything he asked for, while he would be lucky to get a second-hand book for his birthday.

Later that day, the Dursleys took Dudley to the zoo for his birthday treat. Harry was allowed to come along, but he had to stay in the back of the car and not make any noise. He didn't mind. He had never been to the zoo before, and he was excited to see all the animals.

At the zoo, Dudley ran from exhibit to exhibit, demanding to see every animal. Harry followed behind, trying to keep up. He was particularly interested in the snakes, which were kept in glass cases. He had always felt a strange connection to snakes, though he didn't know why.

"Look at this one, Harry!" Dudley said, pointing to a large python. "It's huge!"

Harry looked at the snake. It was indeed very large, and it seemed to be sleeping. But as Harry watched, the snake slowly opened its eyes and looked directly at him. Harry felt a strange sensation, as if the snake was trying to communicate with him.

The snake moved closer to the glass and seemed to be trying to tell Harry something. Harry leaned closer to the glass, and suddenly, the glass disappeared! The snake slithered out of its case and onto the floor.

"Wow!" Dudley said. "How did you do that?"

Harry didn't know how he had done it. He had just wished that the snake could be free, and suddenly the glass was gone. He had never done anything like that before.

The snake looked at Harry one more time, as if to say thank you, and then slithered away. Harry watched it go, feeling both amazed and confused.

The Dursleys were furious. They dragged Harry out of the reptile house and back to the car, where they scolded him for the rest of the day. Harry didn't understand what he had done wrong, but he knew that he had done something that he wasn't supposed to do.

That night, as Harry lay in his cupboard under the stairs, he thought about what had happened at the zoo. He had made the glass disappear, just by wishing it. He had never done anything like that before, but somehow he knew that it wasn't the first time he had done something impossible.

He fell asleep dreaming of snakes and magic, wondering what other impossible things he might be able to do.`,
  scene: {
    title: 'The Zoo Incident',
    description: 'You are Harry Potter at the zoo, trying to explain what happened with the snake',
    context: 'You are at the zoo with the Dursleys for Dudley\'s birthday. You accidentally made the glass disappear from the snake\'s cage, and now the Dursleys are angry. You need to explain what happened.',
    goal: 'Explain the zoo incident to the Dursleys and apologize for what happened',
    difficulty: 'A2',
  },
  order: 2,
  isCompleted: false,
};

// 第三章：The Letters from No One
const chapter3: Chapter = {
  id: 'hp-chapter-3',
  title: 'The Letters from No One',
  content: `Harry's life with the Dursleys was not a happy one. For ten years, he had lived in the cupboard under the stairs, wearing Dudley's old clothes, and being treated as if he didn't exist. But everything was about to change.

It started with the letters. The first one arrived on Harry's eleventh birthday, which was also Dudley's birthday. Harry had never received a letter before, so when he saw the envelope with his name on it, he was very excited.

"Harry! There's a letter for you!" Aunt Petunia said, holding up a thick envelope made of yellowish parchment.

Harry couldn't believe it. A letter for him? He had never received mail before. He reached out to take it, but Uncle Vernon snatched it away.

"Let me see that," Uncle Vernon said, examining the envelope. "Hmm, it's addressed to 'Mr. H. Potter, The Cupboard under the Stairs, 4 Privet Drive, Little Whinging, Surrey.'"

Harry's heart sank. The letter was addressed to his cupboard. Someone knew where he lived, and they knew about his cupboard.

Uncle Vernon turned the envelope over and over in his hands. "This is very strange," he said. "The postmark is from... let me see... it's from Scotland. But there's no return address."

Aunt Petunia looked worried. "Vernon, what if it's from... you know... them?"

Uncle Vernon's face turned purple. "Don't be ridiculous, Petunia. They wouldn't dare. Not after what happened."

Harry didn't understand what they were talking about, but he could see that they were both very worried about the letter. Uncle Vernon put it in his pocket and didn't mention it again.

But the next day, another letter arrived. And the day after that, another one. Each letter was identical to the first, and each one was addressed to Harry's cupboard. Uncle Vernon tried to stop them by changing the mail slot, but the letters kept coming.

On the third day, Uncle Vernon decided to take drastic action. He nailed up the mail slot and put a sign on the door that said "NO MAIL TODAY." But the letters still came, appearing in the most unlikely places: in the milk bottles, in the eggs, even in the bacon.

Finally, Uncle Vernon had had enough. "We're leaving," he announced. "We're going somewhere where they can't find us."

So the Dursleys packed up their car and drove to a small hotel in the middle of nowhere. They thought they were safe there, but they were wrong.

At exactly midnight on Harry's eleventh birthday, there was a loud knock on the door of their hotel room. Uncle Vernon went to answer it, and there, standing in the doorway, was the largest man Harry had ever seen.

He was so tall that he had to duck to get through the door, and so wide that he filled the entire doorway. He had a long, tangled black beard and small, dark eyes that twinkled like stars. He was wearing a long, shaggy coat and heavy boots, and he was carrying a large, pink umbrella.

"Sorry to bother you," the giant man said in a deep, booming voice. "But I'm looking for Harry Potter."

Harry's heart skipped a beat. This man knew his name. And he was looking for him.

"I'm Harry," Harry said, stepping forward.

The giant man's face broke into a huge smile. "Well, well, well," he said. "Harry Potter. I've been looking forward to meeting you for a long time."

"Who are you?" Harry asked.

"Rubeus Hagrid, Keeper of Keys and Grounds at Hogwarts," the giant man said proudly. "But you can call me Hagrid."

"Hogwarts?" Harry repeated. "What's Hogwarts?"

Hagrid looked shocked. "You don't know about Hogwarts? You don't know about magic?"

Harry shook his head. "Magic? What do you mean?"

Hagrid sat down on the bed, which creaked under his weight. "Harry, you're a wizard. And Hogwarts is a school for young witches and wizards."

Harry couldn't believe what he was hearing. A wizard? Him? It seemed impossible. But then he remembered the things that had happened to him over the years: the time he had made his hair grow back overnight, the time he had accidentally made himself invisible, the time he had made the glass disappear at the zoo.

"I'm a wizard?" Harry said.

"You're a wizard, Harry," Hagrid said. "And a powerful one at that. You're famous in the wizarding world."

"Famous? Why am I famous?"

Hagrid's expression became serious. "You're famous because of what happened when you were a baby. You're famous because you're the Boy Who Lived."

"The Boy Who Lived? What does that mean?"

Hagrid took a deep breath. "Harry, when you were a baby, a very dark wizard tried to kill you. But you survived. You're the only person who has ever survived the Killing Curse. And when you survived, the dark wizard was destroyed."

Harry felt dizzy. This was all too much to take in. He was a wizard, he was famous, and he had survived something that should have killed him.

"And now," Hagrid said, pulling out a thick envelope from his coat, "you're invited to attend Hogwarts School of Witchcraft and Wizardry."

He handed Harry the envelope. It was the same letter that had been arriving at the Dursleys' house for days. Harry opened it and read:

HOGWARTS SCHOOL OF WITCHCRAFT AND WIZARDRY

Headmaster: Albus Dumbledore

Dear Mr. Potter,

We are pleased to inform you that you have been accepted at Hogwarts School of Witchcraft and Wizardry. Please find enclosed a list of all necessary books and equipment.

Term begins on September 1. We await your owl by no later than July 31.

Yours sincerely,

Minerva McGonagall
Deputy Headmistress

Harry looked up at Hagrid. "This is real? I'm really going to a school for wizards?"

"You're really going to a school for wizards, Harry," Hagrid said. "And I'm going to take you to get all your supplies. We're going to Diagon Alley, the wizarding shopping district in London."

Harry couldn't believe it. After years of living in a cupboard under the stairs, he was going to a school for wizards. He was going to learn magic. He was going to have friends and adventures and a real home.

"Can we go now?" Harry asked.

Hagrid laughed. "Of course we can, Harry. Let's go to Diagon Alley and get you everything you need for Hogwarts."

And with that, Harry's new life began.`,
  scene: {
    title: 'Meeting Hagrid',
    description: 'You are Harry Potter meeting Hagrid for the first time',
    context: 'You are in a hotel room with the Dursleys when Hagrid, a giant man, knocks on the door. He tells you that you are a wizard and invites you to attend Hogwarts School of Witchcraft and Wizardry. You need to ask questions about this new world.',
    goal: 'Ask Hagrid questions about being a wizard and going to Hogwarts',
    difficulty: 'A2',
  },
  order: 3,
  isCompleted: false,
};

// 创建多章节Quest
export const harryPotterMultiChapterQuest: MultiChapterQuest = {
  id: 'harry-potter-multi-chapter-a2',
  title: 'Harry Potter: The Boy Who Lived',
  description: 'Join Harry Potter on his journey from the cupboard under the stairs to the magical world of Hogwarts. Experience his first encounters with magic, friendship, and adventure.',
  novel: harryPotterNovel,
  chapters: [chapter1, chapter2, chapter3],
  totalChapters: 3,
  difficulty: 'A2',
  estimatedTime: 45, // 45分钟
  tags: ['fantasy', 'magic', 'adventure', 'friendship', 'coming-of-age'],
};
