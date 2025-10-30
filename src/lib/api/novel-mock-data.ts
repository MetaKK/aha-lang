/**
 * 精彩小说内容 Mock 数据
 * 用于Quest挑战系统
 */

import { LIU_CIXIN_STORIES, getLiuCixinStoryById } from '@/data/liucixin-stories';

export interface NovelContent {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  coverImage?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  language: string;
  estimatedTime: string;
  
  // 完整内容
  chapters: NovelChapter[];
  
  // 学习相关
  vocabulary?: VocabularyItem[];
  grammarPoints?: string[];
}

export interface NovelChapter {
  id: string;
  number: number;
  title: string;
  content: string; // 章节正文，使用段落分隔
  wordCount: number;
  estimatedReadTime: number; // 分钟
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example: string;
  audioUrl?: string;
}

// Mock小说内容 - 精彩科幻短篇
export const MOCK_NOVEL: NovelContent = {
  id: 'novel-001',
  title: 'The Visitors\' Zoo',
  author: 'Unknown',
  excerpt: 'Emma and I were on our honeymoon in space. We visited the Moon and flew far away from Earth. But what we discovered would change everything...',
  coverImage: 'https://picsum.photos/seed/novel-space-astronaut/600/900',
  difficulty: 3,
  tags: ['Science Fiction', 'Time Travel', 'Adventure'],
  language: 'English',
  estimatedTime: '8 min',
  
  chapters: [
    {
      id: 'ch-001',
      number: 1,
      title: 'The Visitors\' Zoo',
      content: `Emma and I were on our honeymoon in space. We rented a small old spaceship. It was slow but very romantic. We visited the Moon and flew far away from Earth.

One day, we saw a big rock in space. It was about ten kilometers wide and moving toward Earth. Our computer said, "It will hit Earth in 18 days!"

We tried to call Earth, but no one answered. Ten minutes ago, everything was fine. Now the world was silent. Something was wrong.

When we looked at Earth through the screen, we were shocked. The continents looked different. The computer said, "This is Earth sixty-five million years ago." We had gone back in time!

We understood now — there were no people on Earth yet. We had fallen into a time hole.

Emma looked at the asteroid and said, "Is it the one that killed the dinosaurs?" I nodded slowly. "Yes. We must go back."

We went through the time hole again. This time, we heard strange sounds from Earth, not human voices. When we landed on the sea, a big old ship came to us. The sailors spoke a strange language, but my computer translated it. The captain asked, "Aren't you afraid of being eaten?"

"Eaten? By what?" I asked.

He pointed to the sea. Huge animals came out of the water — dinosaurs! They were alive! Emma held my arm and whispered, "Oh my God, what have we done?"

The captain said, "Don't be afraid. This is a zoo."

We looked around. Far away, we saw very tall buildings — higher than mountains. "Those are the visitors' homes," the captain said. "The visitors?" I asked.

"Yes," he said quietly. "The dinosaurs."

We were speechless. Humans were gone. Dinosaurs had become the masters of Earth. They kept humans as animals in a zoo.

At that moment, Emma pointed to the sky. A bright star was moving fast. The captain said, "That is the Magic Star. Long ago, it almost hit the Earth. But the Savior pushed it away and saved our ancestors."

Emma looked at me. I understood. The "Magic Star" was the asteroid we moved away long ago. Now the dinosaurs worshiped it as a holy star.

We were no longer the rulers of Earth. We were just animals in the dinosaurs' zoo.`,
      wordCount: 385,
      estimatedReadTime: 5,
    },
  ],
  
  vocabulary: [
    {
      word: 'honeymoon',
      definition: 'A vacation spent together by a newly married couple',
      example: 'Emma and I were on our honeymoon in space.',
    },
    {
      word: 'asteroid',
      definition: 'A small rocky body orbiting the sun',
      example: 'We saw a big asteroid moving toward Earth.',
    },
    {
      word: 'shocked',
      definition: 'Surprised and upset by something unexpected',
      example: 'We were shocked when we saw the continents looked different.',
    },
    {
      word: 'ancestors',
      definition: 'People from whom one is descended, especially those more remote than grandparents',
      example: 'The Savior saved our ancestors from extinction.',
    },
    {
      word: 'worshiped',
      definition: 'Showed reverence and adoration for (a deity or sacred object)',
      example: 'The dinosaurs worshiped the asteroid as a holy star.',
    },
    {
      word: 'speechless',
      definition: 'Unable to speak, especially as the result of shock or strong emotion',
      example: 'We were speechless when we learned the truth.',
    },
  ],
  
  grammarPoints: [
    'Past Simple Tense: "were", "visited", "saw", "said"',
    'Past Continuous: "were moving", "was moving"',
    'Past Perfect: "had gone", "had become", "had fallen"',
    'Modal Verbs: "must go back", "would change"',
    'Direct Speech: Using quotation marks for dialogue',
  ],
};

// 根据ID获取小说
export function getNovelById(id: string): NovelContent | undefined {
  if (id === 'novel-001') {
    return MOCK_NOVEL;
  }
  return undefined;
}


// 特殊Quest内容配置（不包含在小说库中的内容）
const QUEST_CONTENT_CONFIG: Record<string, Partial<NovelContent>> = {
  'hp-quest': {
    id: 'hp-a2',
    title: 'Harry Potter: The Boy Who Lived',
    author: 'J.K. Rowling',
    excerpt: 'Join Harry Potter on his journey from the cupboard under the stairs to the magical world of Hogwarts.',
    coverImage: 'https://images.unsplash.com/photo-1600189261867-30e5ffe7b8da?w=400&h=600&fit=crop',
    difficulty: 2,
    tags: ['Fantasy', 'Adventure', 'Magic'],
    language: 'English',
    estimatedTime: '45 min',
    chapters: [
      {
        id: 'hp-ch-001',
        number: 1,
        title: 'The Boy Who Lived',
        content: `Mr. and Mrs. Dursley of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.

Mr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.

The Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere.

The Dursleys had everything they wanted, but they also had a secret, and their greatest fear was that somebody would discover it. They didn't think they could bear it if anyone found out about the Potters. Mrs. Potter was Mrs. Dursley's sister, but they hadn't met for several years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unDursleyish as it was possible to be.

The Potters had a small son, too, and the Dursleys knew that if Dudley was to be friends with him, he would be a very bad influence on their son.

On the day that Harry Potter was born, the Dursleys were celebrating the birth of their own son, Dudley. They were so busy celebrating that they didn't notice the strange things that were happening all over the country. Owls were flying in broad daylight, people in cloaks were whispering excitedly, and there was a feeling of great anticipation in the air.

That night, Professor Dumbledore arrived at Privet Drive with a baby in his arms. The baby had a lightning-shaped scar on his forehead, and his name was Harry Potter. Dumbledore left the baby on the doorstep with a letter explaining everything that had happened.

The next morning, when Mr. Dursley went to get the newspaper, he found the baby on his doorstep. He was shocked and confused, but he knew that this was the beginning of something extraordinary.

And so, Harry Potter came to live with the Dursleys, though they would never know the truth about his past or the magical world that awaited him.`,
        wordCount: 420,
        estimatedReadTime: 6,
      },
      {
        id: 'hp-ch-002',
        number: 2,
        title: 'The Vanishing Glass',
        content: `Nearly ten years had passed since the Dursleys had woken up to find their nephew on the front step, but Privet Drive had hardly changed at all. The sun rose on the same tidy front gardens and lit up the brass number four on the Dursleys' front door; it crept into their living room, which was almost exactly the same as it had been the night when Mr. Dursley had seen that fateful news report about the owls.

Only the photographs on the mantelpiece really showed how much time had passed. Ten years ago there had been lots of pictures of what looked like a large pink beach ball wearing different-colored bonnets—but Dudley Dursley was no longer a baby, and now the photographs showed a large blond boy riding his first bicycle, on a carousel at the fair, playing a computer game with his father, being hugged and kissed by his mother.

The room held no sign at all that another boy lived in the house, too.

Yet Harry Potter was still there, asleep at the moment, but not for long. His Aunt Petunia was awake and it was her shrill voice that made the first noise of the day.

"Up! Get up! Now!"

Harry woke with a start. His aunt rapped on the door again.

"Up!" she screeched. Harry heard her walking toward the kitchen and then the sound of the frying pan being put on the stove. He rolled onto his back and tried to remember the dream he had been having. It had been a good one. There had been a flying motorcycle in it. He had a funny feeling he'd had the same dream before.

His aunt was back outside the door.

"Are you up yet?" she demanded.

"Nearly," said Harry.

"Well, get a move on, I want you to look after the bacon. And don't you dare let it burn, I want everything perfect on Duddy's birthday."

Harry groaned.

"What did you say?" his aunt snapped through the door.

"Nothing, nothing..."

Dudley's birthday—how could he have forgotten? Harry got slowly out of bed and started looking for socks. He found a pair under his bed and, after pulling a spider off one of them, put them on. Harry was used to spiders, because the cupboard under the stairs was full of them, and that was where he slept.

When he was dressed he went down the hall into the kitchen. The table was almost hidden beneath all Dudley's birthday presents. It looked as though Dudley had gotten the new computer he wanted, not to mention the second television and the racing bike. Exactly why Dudley wanted a racing bike was a mystery to Harry, as Dudley was very fat and hated exercise—unless of course it involved punching somebody. Dudley's favorite punching bag was Harry, but he couldn't often catch him. Harry didn't look it, but he was very fast.

Perhaps it had something to do with living in a dark cupboard, but Harry had always been small and skinny for his age. He looked even smaller and skinnier than he really was because all he had to wear were old clothes of Dudley's, and Dudley was about four times bigger than he was. Harry had a thin face, knobbly knees, black hair, and bright green eyes. He wore round glasses held together with a lot of Scotch tape because of all the times Dudley had punched him on the nose. The only thing Harry liked about his own appearance was a very thin scar on his forehead that was shaped like a bolt of lightning. He had had it as long as he could remember, and the first question he could ever remember asking his Aunt Petunia was how he had gotten it.

"In the car crash when your parents died," she had said. "And don't ask questions."

Don't ask questions—that was the first rule for a quiet life with the Dursleys.

Uncle Vernon entered the kitchen as Harry was turning over the bacon.

"Comb your hair!" he barked, by way of a morning greeting.

About once a week, Uncle Vernon looked over the top of his newspaper and shouted that Harry needed a haircut. Harry must have had more haircuts than the rest of the boys in his class put together, but it made no difference, his hair simply grew that way—all over the place.

Harry was frying eggs by the time Dudley arrived in the kitchen with his mother. Dudley looked a lot like Uncle Vernon. He had a large pink face, not much neck, small, watery blue eyes, and thick blond hair that lay smoothly on his thick, fat head. Aunt Petunia often said that Dudley looked like a baby angel—Harry often said that Dudley looked like a pig in a wig.

Harry put the plates of egg and bacon on the table, which was difficult as there wasn't much room. Dudley, meanwhile, was counting his presents. His face fell.

"Thirty-six," he said, looking up at his mother and father. "That's two less than last year."

"Darling, you haven't counted Auntie Marge's present, see, it's here under this big one from Mommy and Daddy."

"All right, thirty-seven then," said Dudley, going red in the face. Harry, who could see a huge Dudley tantrum coming on, began wolfing down his bacon as fast as possible in case Dudley turned the table over.

Aunt Petunia obviously scented danger, too, because she said quickly, "And we'll buy you another two presents while we're out today. How's that, popkin? Two more presents. Is that all right?"

Dudley thought for a moment. It looked like hard work. Finally he said slowly, "So I'll have thirty... thirty..."

"Thirty-nine, sweetums," said Aunt Petunia.

"Oh." Dudley sat down heavily and grabbed the nearest parcel. "All right then."

Uncle Vernon chuckled.

"Little tyke wants his money's worth, just like his father. 'Atta boy, Dudley!" He ruffled Dudley's hair.

At that moment the telephone rang and Aunt Petunia went to answer it while Harry and Uncle Vernon watched Dudley unwrap the racing bike, a video camera, a remote control airplane, sixteen new computer games, and a VCR. He was ripping the paper off a gold wristwatch when Aunt Petunia came back from the telephone looking both angry and worried.

"Bad news, Vernon," she said. "Mrs. Figg's broken her leg. She can't take him." She jerked her head in Harry's direction.

Dudley's mouth fell open in horror, but Harry's heart gave a leap. Every year on Dudley's birthday, his parents took him and a friend out for the day, to adventure parks, hamburger restaurants, or the movies. Every year, Harry was left behind with Mrs. Figg, a mad old lady who lived two streets away. Harry hated it there. The whole house smelled of cabbage and Mrs. Figg made him look at photographs of all the cats she'd ever owned.

"Now what?" said Aunt Petunia, looking furiously at Harry as though he'd planned this. Harry knew he ought to feel sorry that Mrs. Figg had broken her leg, but it wasn't easy when he was reminded of it every single day of his life.

"We could phone Marge," Uncle Vernon suggested.

"Don't be silly, Vernon, she hates the boy."

The Dursleys often spoke about Harry like this, as though he wasn't there—or rather, as though he was something very nasty that couldn't understand them, like a slug.

"What about what's-her-name, your friend—Yvonne?"

"On vacation in Majorca," snapped Aunt Petunia.

"You could just leave me here," Harry put in hopefully (he'd be able to watch what he wanted on television for a change and maybe even have a go on Dudley's computer).

Aunt Petunia looked as though she'd just swallowed a lemon.

"And come back and find the house in ruins?" she snarled.

"I won't blow up the house," said Harry, but they weren't listening.

"I suppose we could take him to the zoo," said Aunt Petunia slowly, "... and leave him in the car..."

"Our new car! In a car park! He'd be bound to do something to it..."

"Vernon, I'm warning you..."

"All right, all right! But the boy stays in the car."

"Right," said Uncle Vernon, "I'm warning you, boy—any funny business, any at all—and you'll be in that cupboard from now until Christmas."

"I'm not going to do anything," said Harry, "honestly..."

But Uncle Vernon didn't believe him. No one ever did.

The problem was, strange things often happened around Harry and he wasn't even trying to do them. It was just that he was used to a lot of things that other people weren't.`,
        wordCount: 850,
        estimatedReadTime: 12,
      },
      {
        id: 'hp-ch-003',
        number: 3,
        title: 'The Letters from No One',
        content: `The escape of the Brazilian boa constrictor earned Harry his longest-ever punishment. By the time he was allowed out of his cupboard again, the summer holidays had started and Dudley had already broken his new video camera, crashed his remote control airplane, and, first time out on his racing bike, knocked down old Mrs. Figg as she crossed Privet Drive on her crutches.

Harry was glad school was over, but there was no escaping Dudley's gang, who visited the house every single day. Piers, Dennis, Malcolm, and Gordon were all big and stupid, but as Dudley was the biggest and stupidest of the lot, he was the leader. The rest of them were all quite happy to join in Dudley's favorite sport: Harry Hunting.

This was why Harry spent as much time as possible out of the house, wandering around and thinking about the end of the holidays, where he could see a tiny ray of hope. When September came he would be going off to secondary school and, for the first time in his life, he wouldn't be with Dudley. Dudley had a place at Uncle Vernon's old school, Smeltings. Piers Polkiss was going there too. Harry, on the other hand, was going to Stonewall High, the local comprehensive. Dudley thought this was very funny.

"They stuff people's heads down the toilet the first day at Stonewall," he told Harry. "Want to come upstairs and practice?"

"No thanks," said Harry. "The poor toilet's never had anything as horrible as your head down it—it might be sick." Then he ran, before Dudley could work out what he'd said.

One day in July, Aunt Petunia took Dudley to London to buy his Smeltings uniform, leaving Harry at Mrs. Figg's. Mrs. Figg wasn't as bad as usual. It turned out she'd broken her leg tripping over one of her cats, and she didn't seem quite as fond of them as before. She let Harry watch television and gave him a bit of chocolate cake that tasted as though she'd had it for several years.

That evening, Dudley paraded around the living room for the family in his brand-new uniform. Smeltings boys wore maroon tailcoats, orange knickerbockers, and flat straw hats called boaters. They also carried knobbly sticks, used for hitting each other while the teachers weren't looking. This was supposed to be a good training for later life.

As he looked at Dudley in his new knickerbockers, Uncle Vernon said gruffly that it was the proudest moment of his life. Aunt Petunia burst into tears and said she couldn't believe it was her Ickle Dudleykins, he looked so handsome and grown-up. Harry didn't trust himself to speak. He thought two of his ribs might already have cracked from trying not to laugh.

There was a horrible smell in the kitchen the next morning when Harry went in for breakfast. It seemed to be coming from a large metal tub in the sink. He went to have a look. The tub was full of what looked like dirty rags swimming in gray water.

"What's this?" he asked Aunt Petunia. Her lips tightened as they always did when he asked a question.

"Your new school uniform," she said.

Harry looked in the bowl again.

"Oh," he said, "I didn't realize it had to be so wet."

"Don't be stupid," snapped Aunt Petunia. "I'm dyeing some of Dudley's old things gray for you. It'll look just like everyone else's when I've finished."

Harry seriously doubted this, but thought it better not to argue. He sat down at the table and tried not to think about how he was going to look on his first day at Stonewall High—like he was wearing bits of old elephant skin, probably.

Dudley's friend Piers Polkiss was coming over, and Aunt Petunia had planned a perfect day for them. She was taking them to the zoo, and then to a restaurant for Dudley's birthday dinner. Harry was going to be left behind with Mrs. Figg again, but the Dursleys had forgotten that she'd broken her leg and couldn't take him. So Harry was going to the zoo too.

The drive to the zoo was very quiet. Harry sat in the back of the Dursleys' car with Piers and Dudley, and they didn't speak to him, though he could hear them whispering about him, sniggering and pointing. He was used to this by now and ignored them.

When they reached the zoo, Uncle Vernon bought them all ice creams from the cart outside, and then, because the smiling lady in the cart asked Harry what flavor he wanted as he handed over the money, Uncle Vernon told her not to bother, he'd have vanilla. Harry didn't mind; he'd never had ice cream before, so even the vanilla tasted wonderful to him.

After lunch they went to the reptile house. It was cool and dark in there, with lit windows all along the walls. Behind the glass, all sorts of lizards and snakes were crawling and slithering over bits of wood and stone. Dudley and Piers wanted to see huge, poisonous cobras and thick, man-eating pythons. Dudley quickly found the largest snake in the place. It could have wrapped its body twice around Uncle Vernon's car and crushed it into a trash can—but at the moment it didn't look in the mood to move. It was fast asleep.

Dudley stood with his nose pressed against the glass, staring at the snake.

"Make it move," he whined at his father. Uncle Vernon tapped on the glass, but the snake didn't budge.

"Do it again," Dudley ordered. Uncle Vernon rapped the glass smartly with his knuckles, but the snake just snoozed on.

"This is boring," Dudley moaned. He shuffled away.

Harry moved in front of the tank and looked intently at the snake. He wouldn't have been surprised if it had died of boredom itself—no company except stupid people drumming their fingers on the glass trying to disturb it all day long. It was worse than having a cupboard as a bedroom, where the only visitor was Aunt Petunia hammering on the door to wake you up; at least people got to visit you in a cupboard.

The snake suddenly opened its beady eyes. Slowly, very slowly, it raised its head until its eyes were on a level with Harry's.

It winked.

Harry stared. Then he looked quickly around to see if anyone was watching. They weren't. He looked back at the snake and winked, too.

The snake jerked its head toward Uncle Vernon and Dudley, then raised its eyes to the ceiling. It gave Harry a look that said quite plainly:

"I get that all the time."

"I know," Harry murmured through the glass, though he wasn't sure the snake could hear him. "It must be really annoying."

The snake nodded vigorously.

"Where do you come from, anyway?" Harry asked.

The snake jabbed its tail at a little sign next to the glass. Harry peered at it.

Boa Constrictor, Brazil.

"Was it nice there?"

The boa constrictor jabbed its tail at the sign again and Harry read on: This specimen was bred in the zoo. "Oh, I see—so you've never been to Brazil?"

As the snake shook its head, a deafening shout behind Harry made both of them jump. "DUDLEY! MR. DURSLEY! COME AND LOOK AT THIS SNAKE! YOU WON'T BELIEVE WHAT IT'S DOING!"

Dudley came waddling toward them as fast as he could.

"Out of the way, you," he said, punching Harry in the ribs. Caught by surprise, Harry fell hard on the concrete floor. What came next happened so fast no one saw how it happened—one second, Piers and Dudley were leaning right up close to the glass, the next, they had leapt back with howls of horror.

Harry sat up and gasped; the glass front of the boa constrictor's tank had vanished. The great snake was uncoiling itself rapidly, slithering out onto the floor. People throughout the reptile house screamed and started running for the exits.

As the snake slid swiftly past him, Harry could have sworn he heard a low, hissing voice say, "Brazil, here I come... Thanksss, amigo."

The keeper of the reptile house was in shock.

"But the glass," he kept saying, "where did the glass go?"

The zoo director himself made Aunt Petunia a cup of strong, sweet tea while he apologized over and over again. Piers and Dudley could only gibber. As far as Harry had seen, the snake had simply rolled over and trotted out of the building. But by the time he was back in Uncle Vernon's car, he was half expecting to find the snake sitting next to him on the backseat.

"How did you do that?" Dudley demanded once they were in the car and driving away from the zoo.

"I didn't do anything," said Harry. "I was just talking to it."

"Talking to it?" Piers repeated faintly.

"Harry, tell us the truth," said Uncle Vernon in a menacing voice, and Harry could see his reflection in the rearview mirror, his small eyes narrowed to slits. "What did you do to the glass?"

"I didn't do anything," Harry insisted. "I was just talking to it, and it winked at me, and I winked back, and then Dudley and Piers came over, and I fell over, and the glass disappeared."

"Liar!" shouted Dudley. "You did it! You made the glass disappear!"

"I didn't!" Harry shouted back. "I was just talking to it!"

"Boys, boys," said Aunt Petunia nervously. "I'm sure it was just an accident. The glass must have been faulty."

But Uncle Vernon didn't look as though he believed it was an accident. All the way home, he kept shooting Harry nasty looks through the rearview mirror.

When they got back to Privet Drive, Harry was sent straight to his cupboard. He didn't mind; it was better than being in the car with Uncle Vernon, who was still muttering about "strange business" and "not normal" and "shouldn't be allowed."

Harry sat in the dark and thought about what had happened. He had talked to a snake, and the snake had understood him. And then the glass had disappeared. He had always known he was different, but this was the first time he had ever done anything that proved it.

He wondered if this was what his parents had been like. Had they been able to do strange things too? Was that why they had died in a car crash? Had they been doing something they shouldn't have been doing?

Harry didn't know, but he had a feeling that his life was about to change. And he was right.`,
        wordCount: 1200,
        estimatedReadTime: 18,
      }
    ]
  },
  // Peppa Pig A1 简单Quest（热门章节）
  'peppa-001': {
    id: 'peppa-001',
    title: 'Peppa Pig: Muddy Puddles',
    author: 'Peppa Pig',
    excerpt: 'Peppa and George love jumping in muddy puddles. But first, they must wear their boots!',
    coverImage: 'https://picsum.photos/seed/peppa-001/400/600',
    difficulty: 1,
    tags: ['Kids', 'Family', 'Daily Life'],
    language: 'English',
    estimatedTime: '3 min',
    chapters: [{ id: 'pp-001-ch1', number: 1, title: 'Muddy Puddles', content: 'Peppa and George go outside. It is raining. They see a muddy puddle. They put on boots and jump! Splash!', wordCount: 80, estimatedReadTime: 2 }],
  },
  'peppa-002': {
    id: 'peppa-002',
    title: 'Peppa Pig: The Tooth Fairy',
    author: 'Peppa Pig',
    excerpt: 'Peppa loses a tooth. She puts it under her pillow for the Tooth Fairy.',
    coverImage: 'https://picsum.photos/seed/peppa-002/400/600',
    difficulty: 1,
    tags: ['Kids', 'Family', 'Daily Life'],
    language: 'English',
    estimatedTime: '3 min',
    chapters: [{ id: 'pp-002-ch1', number: 1, title: 'The Tooth Fairy', content: 'Peppa wiggles her tooth. It falls out! She puts it under her pillow. In the morning, there is a shiny coin.', wordCount: 80, estimatedReadTime: 2 }],
  },
  'peppa-003': {
    id: 'peppa-003',
    title: 'Peppa Pig: Picnic',
    author: 'Peppa Pig',
    excerpt: 'The family goes on a picnic. They eat sandwiches and play games.',
    coverImage: 'https://picsum.photos/seed/peppa-003/400/600',
    difficulty: 1,
    tags: ['Kids', 'Food', 'Outdoor'],
    language: 'English',
    estimatedTime: '3 min',
    chapters: [{ id: 'pp-003-ch1', number: 1, title: 'Picnic Time', content: 'Peppa and her family pack a basket. They sit on a blanket. They share fruit and sandwiches. It is a happy day.', wordCount: 85, estimatedReadTime: 2 }],
  },
  'peppa-004': {
    id: 'peppa-004',
    title: 'Peppa Pig: The Playground',
    author: 'Peppa Pig',
    excerpt: 'Peppa meets friends at the playground. They slide, swing, and laugh.',
    coverImage: 'https://picsum.photos/seed/peppa-004/400/600',
    difficulty: 1,
    tags: ['Kids', 'Play', 'Friends'],
    language: 'English',
    estimatedTime: '3 min',
    chapters: [{ id: 'pp-004-ch1', number: 1, title: 'Play Together', content: 'Peppa runs to the slide. George goes to the swing. Suzy Sheep joins them. They play and take turns.', wordCount: 85, estimatedReadTime: 2 }],
  },
  'peppa-005': {
    id: 'peppa-005',
    title: 'Peppa Pig: Bedtime',
    author: 'Peppa Pig',
    excerpt: 'It is bedtime. Peppa brushes her teeth and listens to a story.',
    coverImage: 'https://picsum.photos/seed/peppa-005/400/600',
    difficulty: 1,
    tags: ['Kids', 'Daily Routine', 'Family'],
    language: 'English',
    estimatedTime: '3 min',
    chapters: [{ id: 'pp-005-ch1', number: 1, title: 'Good Night', content: 'Peppa puts on pajamas. She brushes her teeth. Daddy Pig reads a story. “Good night,” says Peppa.', wordCount: 70, estimatedReadTime: 2 }],
  },
};

// 通用解析：根据ID在多处数据源中解析内容
function resolveContentById(rawId: string): NovelContent | undefined {
  // 1) 直接命中：内置单篇小说
  const novel = getNovelById(rawId);
  if (novel) return novel;

  // 2) 专题合集：刘慈欣短篇
  const liu = getLiuCixinStoryById(rawId);
  if (liu) return liu;

  // 3) 特殊Quest配置（HP、Peppa等）
  const special = (QUEST_CONTENT_CONFIG as Record<string, Partial<NovelContent>>)[rawId];
  if (special) return special as NovelContent;

  return undefined;
}

// 统一的内容获取函数（健壮映射）
export function getContentById(id: string): NovelContent | undefined {
  // 先尝试原始ID
  const direct = resolveContentById(id);
  if (direct) return direct;

  // 通用Quest前缀映射：形如 quest-<baseId> → <baseId>
  if (id.startsWith('quest-')) {
    const baseId = id.slice('quest-'.length);
    const mapped = resolveContentById(baseId);
    if (mapped) return mapped;
  }

  // 向后兼容：老的手动映射（保留示例）
  if (id === 'quest-novel-001') {
    return getNovelById('novel-001');
  }

  return undefined;
}


