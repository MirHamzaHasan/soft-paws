insert into public.training_programs (
  slug,
  name,
  description,
  category,
  difficulty,
  estimated_days,
  icon,
  sort_order
)
values
  (
    'sit-stay-foundations',
    'Sit & stay foundations',
    'Build a calm sit, a clear release word, and a short stay that works around everyday distractions.',
    'obedience',
    'beginner',
    7,
    'hand',
    10
  ),
  (
    'loose-leash-walking',
    'Loose leash walking',
    'Practice calm leash skills with rewards, sniff breaks, and simple turns before pulling builds.',
    'leash_skills',
    'beginner',
    10,
    'footprints',
    20
  ),
  (
    'recall-come-when-called',
    'Recall (come when called)',
    'Grow a happy recall cue from quiet indoor practice to safe outdoor distance and mild distractions.',
    'obedience',
    'intermediate',
    10,
    'megaphone',
    30
  ),
  (
    'calm-greetings',
    'Calm greetings',
    'Help your dog greet people with four paws on the floor using distance, rewards, and simple resets.',
    'socialization',
    'beginner',
    7,
    'smile',
    40
  ),
  (
    'crate-training',
    'Crate training',
    'Build a positive crate routine through choice, short sessions, food, and calm exits.',
    'puppy_basics',
    'beginner',
    7,
    'home',
    50
  ),
  (
    'reactivity-management',
    'Reactivity management',
    'Support calmer walks by noticing comfortable distance, rewarding quiet observation, and practicing easy exits.',
    'behavior_modification',
    'intermediate',
    14,
    'eye',
    60
  ),
  (
    'leave-it-drop-it',
    'Leave it / drop it',
    'Teach safe trades and impulse control from easy indoor objects to outdoor distractions.',
    'obedience',
    'beginner',
    5,
    'badge-check',
    70
  ),
  (
    'separation-comfort',
    'Separation comfort',
    'Build alone-time comfort in tiny steps while tracking what stays calm and repeatable.',
    'behavior_modification',
    'intermediate',
    14,
    'clock',
    80
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  difficulty = excluded.difficulty,
  estimated_days = excluded.estimated_days,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

with step_seed (
  program_slug,
  step_number,
  title,
  instruction,
  tip,
  estimated_duration_min
) as (
  values
    (
      'sit-stay-foundations',
      1,
      'Lure the sit',
      'Hold a treat at your dog nose, then slowly move it up and slightly back until the rear touches the floor. Mark the moment your dog sits and reward right away. Success looks like three easy sits with a loose body.',
      'Use a pea-size treat so you can repeat quickly without overfeeding.',
      8
    ),
    (
      'sit-stay-foundations',
      2,
      'Name the cue',
      'Say Sit once, then use the same small hand motion from day one. Mark and reward when your dog sits within two seconds. Success looks like five sits after one calm cue.',
      'If your dog pauses, make the hand motion easier before adding more words.',
      8
    ),
    (
      'sit-stay-foundations',
      3,
      'Add a release word',
      'Ask for Sit, reward, then say Free and toss a treat a step away. The release word teaches when the sit is finished. Success looks like your dog waiting for Free before moving three times in a row.',
      'Pick one release word and keep it consistent across the household.',
      8
    ),
    (
      'sit-stay-foundations',
      4,
      'Build one-second stay',
      'Ask for Sit, pause for one second, then mark and reward before releasing. Keep your body still so the pause is easy to understand. Success looks like five one-second stays with relaxed attention.',
      'Short, clean wins build faster than one long attempt.',
      10
    ),
    (
      'sit-stay-foundations',
      5,
      'Add one step of distance',
      'Ask for Sit, pause, step back once, return, reward, and release. If your dog stands, reset closer and make the next try easier. Success looks like three stays while you take one step away.',
      'High-energy dogs may do better after a short sniff walk first.',
      10
    ),
    (
      'sit-stay-foundations',
      6,
      'Add mild distractions',
      'Ask for Sit while you hold a toy at your side or take a slow step sideways. Reward calm stillness before the distraction becomes too hard. Success looks like your dog holding position around two easy distractions.',
      'Keep distractions boring enough that your dog can still win.',
      10
    ),
    (
      'sit-stay-foundations',
      7,
      'Practice in new rooms',
      'Repeat the sit, stay, and release pattern in two different rooms. Lower the distance and duration when the room changes. Success looks like your dog understanding the cue in more than one place.',
      'New places make old skills feel new, so reduce difficulty first.',
      12
    ),
    (
      'loose-leash-walking',
      1,
      'Reward beside you',
      'Stand still with your dog on leash and reward any moment your dog is beside your leg with a loose leash. Take one step, mark beside-you position, and reward again. Success looks like your dog checking in beside you without leash tension.',
      'Start indoors or in a quiet driveway before using sidewalks.',
      8
    ),
    (
      'loose-leash-walking',
      2,
      'Take five calm steps',
      'Walk five steps and reward while the leash stays loose. Stop before pulling starts so the pattern stays easy. Success looks like three sets of five steps with the leash making a soft curve.',
      'Use small treats delivered near your leg to show the best walking zone.',
      10
    ),
    (
      'loose-leash-walking',
      3,
      'Turn before tension',
      'When your dog begins to move ahead, say This way and turn gently with upbeat movement. Reward when your dog catches up beside you. Success looks like your dog following two turns without leash tension.',
      'Practice turns in a low-distraction area so the cue feels fun.',
      10
    ),
    (
      'loose-leash-walking',
      4,
      'Add sniff breaks',
      'Walk a short loose-leash stretch, then say Go sniff and let your dog explore. Sniff breaks become a reward for calm walking. Success looks like your dog returning to walking after a short sniff break.',
      'Sniffing is useful enrichment and can make training easier.',
      12
    ),
    (
      'loose-leash-walking',
      5,
      'Practice doorways',
      'Pause before leaving home and reward a loose leash near the door. Step out only when the leash is soft, then reward outside. Success looks like exiting the doorway without a surge forward.',
      'If the doorway is exciting, practice when you are not starting a real walk.',
      10
    ),
    (
      'loose-leash-walking',
      6,
      'Add mild outdoor distractions',
      'Choose a quiet block and reward check-ins before your dog reaches the end of the leash. Use a turn or sniff break when interest rises. Success looks like passing one mild distraction with a loose leash reset.',
      'Distance is your friend; cross the street if your dog needs more room.',
      12
    ),
    (
      'loose-leash-walking',
      7,
      'Build longer routes',
      'Combine short loose-leash stretches, sniff breaks, and turns for a five-minute route. Reward quality walking often enough that your dog stays engaged. Success looks like more loose-leash moments than pulling moments.',
      'For high-drive dogs, keep the route short and repeatable before adding distance.',
      15
    ),
    (
      'recall-come-when-called',
      1,
      'Charge the recall cue',
      'Say Come in a cheerful voice and immediately feed a high-value reward while your dog is already near you. Repeat without asking for distance yet. Success looks like your dog brightening when the cue is spoken.',
      'Use a special reward that appears only for recall practice.',
      8
    ),
    (
      'recall-come-when-called',
      2,
      'Short indoor recalls',
      'Take two steps away, say Come once, and reward when your dog reaches you. Celebrate close arrival with food, praise, or a quick game. Success looks like five happy recalls across a quiet room.',
      'Crouch slightly and open your hands to look inviting.',
      10
    ),
    (
      'recall-come-when-called',
      3,
      'Add happy movement',
      'Say Come and jog backward a few steps so your dog can chase you. Reward near your body, then release your dog back to explore. Success looks like your dog moving toward you quickly and staying close for the reward.',
      'Never use recall to end every fun moment, or the cue may lose value.',
      10
    ),
    (
      'recall-come-when-called',
      4,
      'Call from another room',
      'Start where your dog can still hear you clearly and call once from a doorway. Reward generously when your dog finds you. Success looks like your dog coming from another room three times.',
      'If your dog does not come, reduce distance and make the next try easier.',
      10
    ),
    (
      'recall-come-when-called',
      5,
      'Practice in a fenced area',
      'Use a secure yard or enclosed space and wait for a calm moment before calling. Reward arrival, hold the collar or harness gently for one second, then release. Success looks like your dog returning even with light outdoor interest nearby.',
      'Safety first: use fenced areas or a long line outside.',
      12
    ),
    (
      'recall-come-when-called',
      6,
      'Add safe distance',
      'Let your dog move farther away on a long line, then call when attention is not fully locked on something else. Reward close arrival and release again. Success looks like three recalls from a longer distance with a loose line.',
      'Build distance only when the shorter version is easy.',
      12
    ),
    (
      'recall-come-when-called',
      7,
      'Mild distraction recalls',
      'Choose easy distractions, such as leaves or quiet smells, and call before your dog is fully absorbed. Reward heavily for turning away and coming back. Success looks like your dog choosing you over one mild distraction.',
      'Keep the reward better than the distraction while the skill is growing.',
      15
    ),
    (
      'calm-greetings',
      1,
      'Reward four paws',
      'Stand near your dog and reward when all four paws are on the floor. If your dog jumps, pause quietly and reward the next grounded moment. Success looks like your dog offering four paws down for three greetings.',
      'Deliver rewards low so your dog does not need to bounce upward.',
      8
    ),
    (
      'calm-greetings',
      2,
      'Practice with family',
      'Have a familiar person approach slowly while you reward four paws on the floor. The helper turns sideways and stays calm. Success looks like your dog greeting one familiar person without jumping.',
      'Ask helpers to keep hands low and voices soft during early practice.',
      10
    ),
    (
      'calm-greetings',
      3,
      'Add a door routine',
      'Before opening the door, scatter a few treats away from the entry path. Let your dog find the treats while the person enters calmly. Success looks like your dog staying busy and grounded as the door opens.',
      'Prepare treats before the doorbell or planned knock.',
      10
    ),
    (
      'calm-greetings',
      4,
      'Use distance resets',
      'If excitement rises, guide your dog farther from the person and reward calm looking. Move closer only when the body softens again. Success looks like your dog settling faster after one reset.',
      'Distance is not failure; it is a way to help your dog think.',
      10
    ),
    (
      'calm-greetings',
      5,
      'Practice on walks',
      'Ask for a simple check-in before greeting someone outside. If your dog can keep four paws down, allow a brief hello and reward after. Success looks like one short outdoor greeting without jumping.',
      'Skip greetings when the sidewalk is too crowded or exciting.',
      12
    ),
    (
      'calm-greetings',
      6,
      'Add short guest visits',
      'Set up a five-minute visit with one calm guest and reward settled moments near you. End the visit before excitement builds too high. Success looks like your dog returning to you for rewards during the visit.',
      'Short successful visits teach more than long chaotic ones.',
      15
    ),
    (
      'crate-training',
      1,
      'Explore the open crate',
      'Leave the crate door open and place treats just inside the entrance. Let your dog choose to investigate without closing the door. Success looks like your dog stepping toward or into the crate with a loose body.',
      'Put the crate near normal family activity, not isolated at first.',
      8
    ),
    (
      'crate-training',
      2,
      'Feed near the crate',
      'Place a meal or stuffed food toy near the crate opening, then gradually move it just inside. Keep the door open so the crate predicts good things. Success looks like your dog eating comfortably near or inside the crate.',
      'Move the food farther inside only when the current spot is easy.',
      10
    ),
    (
      'crate-training',
      3,
      'Step inside and out',
      'Toss a treat into the crate and let your dog enter, eat, and leave. Add a second treat after entry so staying inside briefly pays off. Success looks like your dog entering and turning around comfortably.',
      'Use a mat or soft bedding if your dog prefers more traction.',
      10
    ),
    (
      'crate-training',
      4,
      'Close the door briefly',
      'When your dog is eating inside, close the door for one second and open it again before concern appears. Reward calm behavior after the door opens. Success looks like three calm one-second door closures.',
      'Keep early door closures so short they feel almost boring.',
      8
    ),
    (
      'crate-training',
      5,
      'Add quiet duration',
      'Give a safe chew or food toy in the crate and sit nearby while your dog settles. Open the door while your dog is still calm. Success looks like one relaxed minute in the crate with you nearby.',
      'High-energy puppies may need potty time and a short play session first.',
      12
    ),
    (
      'crate-training',
      6,
      'Practice calm exits',
      'Open the crate door slightly, then reward if your dog waits instead of rushing out. Say Free and invite your dog out calmly. Success looks like your dog pausing at the open door before exiting.',
      'A calm exit keeps the crate routine predictable from start to finish.',
      8
    ),
    (
      'reactivity-management',
      1,
      'Find comfortable distance',
      'Notice how far away your dog can see a trigger and still take treats or look back at you. Start practice at that distance or farther. Success looks like your dog observing without barking, lunging, or freezing.',
      'Choose wide spaces where you can add distance easily.',
      10
    ),
    (
      'reactivity-management',
      2,
      'Mark calm looking',
      'When your dog looks at the trigger calmly, mark and feed before intensity rises. Let your dog look again and reward another calm glance. Success looks like two calm looks followed by easy treat taking.',
      'Use soft food that is fast to eat so your dog can keep thinking.',
      10
    ),
    (
      'reactivity-management',
      3,
      'Pair triggers with rewards',
      'At a comfortable distance, feed a reward each time the trigger appears. Stop feeding when the trigger disappears. Success looks like your dog noticing the trigger and then checking for the reward.',
      'This is pattern building, not a test, so keep setups easy.',
      12
    ),
    (
      'reactivity-management',
      4,
      'Practice retreat turns',
      'Say This way, turn with your dog, and reward after you create space. Practice when the environment is easy before using it in real moments. Success looks like your dog following the turn without leash tension.',
      'A cheerful retreat protects progress and keeps walks calmer.',
      10
    ),
    (
      'reactivity-management',
      5,
      'Add a simple pattern game',
      'Count one-two-three out loud and feed on three while moving away from the trigger. Repeat the same rhythm several times. Success looks like your dog following the pattern and taking food while leaving space.',
      'Predictable patterns can help dogs settle when the world feels busy.',
      12
    ),
    (
      'reactivity-management',
      6,
      'Shorten recovery time',
      'After a surprise trigger, move away and reward any check-in or sniffing. Track how long it takes your dog to relax again. Success looks like your dog recovering faster than the last similar setup.',
      'Compare similar setups rather than judging every walk the same way.',
      10
    ),
    (
      'reactivity-management',
      7,
      'Track easier setups',
      'Log the distance, trigger type, and reward that helped your dog stay calm. Repeat the easiest setup before increasing difficulty. Success looks like two sessions with the same comfortable pattern.',
      'Reliable easy wins are the foundation for harder environments.',
      8
    ),
    (
      'reactivity-management',
      8,
      'Build one closer step',
      'Move slightly closer only after your dog succeeds at the current distance. Reward calm looking and use a retreat turn before intensity rises. Success looks like one closer setup that still feels manageable.',
      'Tiny changes protect confidence for both you and your dog.',
      12
    ),
    (
      'leave-it-drop-it',
      1,
      'Trade for a treat',
      'Offer a safe toy, then present a treat near your dog nose. When your dog releases the toy, mark, reward, and give the toy back. Success looks like your dog happily trading without guarding the item.',
      'Returning the toy teaches that releasing does not always end the fun.',
      8
    ),
    (
      'leave-it-drop-it',
      2,
      'Add the drop cue',
      'Say Drop once, then present the treat trade. Reward the release and offer the toy again when appropriate. Success looks like your dog releasing after the cue and before the treat reaches the mouth.',
      'Use low-value toys first so the trade is easy.',
      8
    ),
    (
      'leave-it-drop-it',
      3,
      'Covered food leave it',
      'Place food under your closed hand and wait quietly. Mark and reward from your other hand when your dog backs away or looks at you. Success looks like your dog moving away from the covered food three times.',
      'The reward should come from you, not from the covered food.',
      10
    ),
    (
      'leave-it-drop-it',
      4,
      'Open-hand leave it',
      'Show food on an open palm and close your hand if your dog moves toward it. Mark and reward from the other hand when your dog pauses or looks away. Success looks like your dog ignoring the open-hand food for two seconds.',
      'Keep your hand low and still so the picture is clear.',
      10
    ),
    (
      'leave-it-drop-it',
      5,
      'Practice outdoor distractions',
      'Use a safe item on the ground and cue Leave it before your dog reaches it. Reward turning away and move on together. Success looks like your dog passing one outdoor item without grabbing it.',
      'Start with boring outdoor items before practicing near food or wildlife smells.',
      12
    ),
    (
      'separation-comfort',
      1,
      'Create a settle station',
      'Choose a bed, mat, or crate area and reward your dog for resting there while you stay nearby. Keep the session calm and short. Success looks like your dog choosing the station for one relaxed minute.',
      'Use this station outside departure practice so it feels safe and normal.',
      10
    ),
    (
      'separation-comfort',
      2,
      'Practice tiny departures',
      'Step behind a doorway for one second, return, and reward calm behavior. Repeat only while your dog stays relaxed. Success looks like five one-second departures without pacing or vocalizing.',
      'Tiny starts are useful data, not a sign that progress is slow.',
      8
    ),
    (
      'separation-comfort',
      3,
      'Build door seconds',
      'Move from one second to three seconds only if the shorter version stays calm. Return quietly and reward settled behavior. Success looks like your dog staying relaxed through three short door absences.',
      'Increase time in small steps rather than jumping to minutes.',
      10
    ),
    (
      'separation-comfort',
      4,
      'Add real-life cues',
      'Pick up keys or put on shoes, then sit back down and reward calm behavior. Keep these cues separate from real departures at first. Success looks like your dog noticing the cue without following you anxiously.',
      'Practice one cue at a time so you can see what changes.',
      10
    ),
    (
      'separation-comfort',
      5,
      'Practice short returns',
      'Leave for a very short duration your dog has already handled well, then return calmly. Reward settled behavior after a few quiet seconds. Success looks like your dog staying calm before and after your return.',
      'Low-key returns help departures feel routine.',
      10
    ),
    (
      'separation-comfort',
      6,
      'Extend after calm reps',
      'Add a few seconds only after two calm repetitions at the current duration. If your dog shows concern, return to the last easy duration. Success looks like your dog completing a slightly longer absence with the same relaxed body.',
      'Progress is based on comfort signals, not the calendar.',
      12
    ),
    (
      'separation-comfort',
      7,
      'Track the best window',
      'Log the duration, setup, and time of day for the easiest departures. Repeat the best window before adding harder details. Success looks like a repeatable alone-time setup your dog handles calmly.',
      'Patterns help you choose the kindest next step.',
      8
    )
)
insert into public.training_steps (
  program_id,
  step_number,
  title,
  instruction,
  tip,
  estimated_duration_min
)
select
  training_programs.id,
  step_seed.step_number,
  step_seed.title,
  step_seed.instruction,
  step_seed.tip,
  step_seed.estimated_duration_min
from step_seed
join public.training_programs
  on training_programs.slug = step_seed.program_slug
on conflict (program_id, step_number) do update
set
  title = excluded.title,
  instruction = excluded.instruction,
  tip = excluded.tip,
  estimated_duration_min = excluded.estimated_duration_min;
