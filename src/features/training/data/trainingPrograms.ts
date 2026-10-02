import type { TrainingProgramRow, TrainingStepRow } from '@/api/training';

export const TRAINING_PROGRAMS: TrainingProgramRow[] = [
  {
    "id": "sit-stay-foundations",
    "slug": "sit-stay-foundations",
    "name": "Sit & stay foundations",
    "description": "Build a calm sit, a clear release word, and a short stay that works around everyday distractions.",
    "category": "obedience",
    "difficulty": "beginner",
    "estimated_days": 7,
    "icon": "hand",
    "sort_order": 10,
    "created_at": null
  },
  {
    "id": "loose-leash-walking",
    "slug": "loose-leash-walking",
    "name": "Loose leash walking",
    "description": "Practice calm leash skills with rewards, sniff breaks, and simple turns before pulling builds.",
    "category": "leash_skills",
    "difficulty": "beginner",
    "estimated_days": 10,
    "icon": "footprints",
    "sort_order": 20,
    "created_at": null
  },
  {
    "id": "recall-come-when-called",
    "slug": "recall-come-when-called",
    "name": "Recall (come when called)",
    "description": "Grow a happy recall cue from quiet indoor practice to safe outdoor distance and mild distractions.",
    "category": "obedience",
    "difficulty": "intermediate",
    "estimated_days": 10,
    "icon": "megaphone",
    "sort_order": 30,
    "created_at": null
  },
  {
    "id": "calm-greetings",
    "slug": "calm-greetings",
    "name": "Calm greetings",
    "description": "Help your dog greet people with four paws on the floor using distance, rewards, and simple resets.",
    "category": "socialization",
    "difficulty": "beginner",
    "estimated_days": 7,
    "icon": "smile",
    "sort_order": 40,
    "created_at": null
  },
  {
    "id": "crate-training",
    "slug": "crate-training",
    "name": "Crate training",
    "description": "Build a positive crate routine through choice, short sessions, food, and calm exits.",
    "category": "puppy_basics",
    "difficulty": "beginner",
    "estimated_days": 7,
    "icon": "home",
    "sort_order": 50,
    "created_at": null
  },
  {
    "id": "reactivity-management",
    "slug": "reactivity-management",
    "name": "Reactivity management",
    "description": "Support calmer walks by noticing comfortable distance, rewarding quiet observation, and practicing easy exits.",
    "category": "behavior_modification",
    "difficulty": "intermediate",
    "estimated_days": 14,
    "icon": "eye",
    "sort_order": 60,
    "created_at": null
  },
  {
    "id": "leave-it-drop-it",
    "slug": "leave-it-drop-it",
    "name": "Leave it / drop it",
    "description": "Teach safe trades and impulse control from easy indoor objects to outdoor distractions.",
    "category": "obedience",
    "difficulty": "beginner",
    "estimated_days": 5,
    "icon": "badge-check",
    "sort_order": 70,
    "created_at": null
  },
  {
    "id": "separation-comfort",
    "slug": "separation-comfort",
    "name": "Separation comfort",
    "description": "Build alone-time comfort in tiny steps while tracking what stays calm and repeatable.",
    "category": "behavior_modification",
    "difficulty": "intermediate",
    "estimated_days": 14,
    "icon": "clock",
    "sort_order": 80,
    "created_at": null
  }
];

export const TRAINING_STEPS: TrainingStepRow[] = [
  {
    "id": "sit-stay-foundations-1",
    "program_id": "sit-stay-foundations",
    "step_number": 1,
    "title": "Lure the sit",
    "instruction": "Hold a treat at your dog nose, then slowly move it up and slightly back until the rear touches the floor. Mark the moment your dog sits and reward right away. Success looks like three easy sits with a loose body.",
    "tip": "Use a pea-size treat so you can repeat quickly without overfeeding.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "sit-stay-foundations-2",
    "program_id": "sit-stay-foundations",
    "step_number": 2,
    "title": "Name the cue",
    "instruction": "Say Sit once, then use the same small hand motion from day one. Mark and reward when your dog sits within two seconds. Success looks like five sits after one calm cue.",
    "tip": "If your dog pauses, make the hand motion easier before adding more words.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "sit-stay-foundations-3",
    "program_id": "sit-stay-foundations",
    "step_number": 3,
    "title": "Add a release word",
    "instruction": "Ask for Sit, reward, then say Free and toss a treat a step away. The release word teaches when the sit is finished. Success looks like your dog waiting for Free before moving three times in a row.",
    "tip": "Pick one release word and keep it consistent across the household.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "sit-stay-foundations-4",
    "program_id": "sit-stay-foundations",
    "step_number": 4,
    "title": "Build one-second stay",
    "instruction": "Ask for Sit, pause for one second, then mark and reward before releasing. Keep your body still so the pause is easy to understand. Success looks like five one-second stays with relaxed attention.",
    "tip": "Short, clean wins build faster than one long attempt.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "sit-stay-foundations-5",
    "program_id": "sit-stay-foundations",
    "step_number": 5,
    "title": "Add one step of distance",
    "instruction": "Ask for Sit, pause, step back once, return, reward, and release. If your dog stands, reset closer and make the next try easier. Success looks like three stays while you take one step away.",
    "tip": "High-energy dogs may do better after a short sniff walk first.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "sit-stay-foundations-6",
    "program_id": "sit-stay-foundations",
    "step_number": 6,
    "title": "Add mild distractions",
    "instruction": "Ask for Sit while you hold a toy at your side or take a slow step sideways. Reward calm stillness before the distraction becomes too hard. Success looks like your dog holding position around two easy distractions.",
    "tip": "Keep distractions boring enough that your dog can still win.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "sit-stay-foundations-7",
    "program_id": "sit-stay-foundations",
    "step_number": 7,
    "title": "Practice in new rooms",
    "instruction": "Repeat the sit, stay, and release pattern in two different rooms. Lower the distance and duration when the room changes. Success looks like your dog understanding the cue in more than one place.",
    "tip": "New places make old skills feel new, so reduce difficulty first.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-1",
    "program_id": "loose-leash-walking",
    "step_number": 1,
    "title": "Reward beside you",
    "instruction": "Stand still with your dog on leash and reward any moment your dog is beside your leg with a loose leash. Take one step, mark beside-you position, and reward again. Success looks like your dog checking in beside you without leash tension.",
    "tip": "Start indoors or in a quiet driveway before using sidewalks.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-2",
    "program_id": "loose-leash-walking",
    "step_number": 2,
    "title": "Take five calm steps",
    "instruction": "Walk five steps and reward while the leash stays loose. Stop before pulling starts so the pattern stays easy. Success looks like three sets of five steps with the leash making a soft curve.",
    "tip": "Use small treats delivered near your leg to show the best walking zone.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-3",
    "program_id": "loose-leash-walking",
    "step_number": 3,
    "title": "Turn before tension",
    "instruction": "When your dog begins to move ahead, say This way and turn gently with upbeat movement. Reward when your dog catches up beside you. Success looks like your dog following two turns without leash tension.",
    "tip": "Practice turns in a low-distraction area so the cue feels fun.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-4",
    "program_id": "loose-leash-walking",
    "step_number": 4,
    "title": "Add sniff breaks",
    "instruction": "Walk a short loose-leash stretch, then say Go sniff and let your dog explore. Sniff breaks become a reward for calm walking. Success looks like your dog returning to walking after a short sniff break.",
    "tip": "Sniffing is useful enrichment and can make training easier.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-5",
    "program_id": "loose-leash-walking",
    "step_number": 5,
    "title": "Practice doorways",
    "instruction": "Pause before leaving home and reward a loose leash near the door. Step out only when the leash is soft, then reward outside. Success looks like exiting the doorway without a surge forward.",
    "tip": "If the doorway is exciting, practice when you are not starting a real walk.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-6",
    "program_id": "loose-leash-walking",
    "step_number": 6,
    "title": "Add mild outdoor distractions",
    "instruction": "Choose a quiet block and reward check-ins before your dog reaches the end of the leash. Use a turn or sniff break when interest rises. Success looks like passing one mild distraction with a loose leash reset.",
    "tip": "Distance is your friend; cross the street if your dog needs more room.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "loose-leash-walking-7",
    "program_id": "loose-leash-walking",
    "step_number": 7,
    "title": "Build longer routes",
    "instruction": "Combine short loose-leash stretches, sniff breaks, and turns for a five-minute route. Reward quality walking often enough that your dog stays engaged. Success looks like more loose-leash moments than pulling moments.",
    "tip": "For high-drive dogs, keep the route short and repeatable before adding distance.",
    "estimated_duration_min": 15,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-1",
    "program_id": "recall-come-when-called",
    "step_number": 1,
    "title": "Charge the recall cue",
    "instruction": "Say Come in a cheerful voice and immediately feed a high-value reward while your dog is already near you. Repeat without asking for distance yet. Success looks like your dog brightening when the cue is spoken.",
    "tip": "Use a special reward that appears only for recall practice.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-2",
    "program_id": "recall-come-when-called",
    "step_number": 2,
    "title": "Short indoor recalls",
    "instruction": "Take two steps away, say Come once, and reward when your dog reaches you. Celebrate close arrival with food, praise, or a quick game. Success looks like five happy recalls across a quiet room.",
    "tip": "Crouch slightly and open your hands to look inviting.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-3",
    "program_id": "recall-come-when-called",
    "step_number": 3,
    "title": "Add happy movement",
    "instruction": "Say Come and jog backward a few steps so your dog can chase you. Reward near your body, then release your dog back to explore. Success looks like your dog moving toward you quickly and staying close for the reward.",
    "tip": "Never use recall to end every fun moment, or the cue may lose value.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-4",
    "program_id": "recall-come-when-called",
    "step_number": 4,
    "title": "Call from another room",
    "instruction": "Start where your dog can still hear you clearly and call once from a doorway. Reward generously when your dog finds you. Success looks like your dog coming from another room three times.",
    "tip": "If your dog does not come, reduce distance and make the next try easier.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-5",
    "program_id": "recall-come-when-called",
    "step_number": 5,
    "title": "Practice in a fenced area",
    "instruction": "Use a secure yard or enclosed space and wait for a calm moment before calling. Reward arrival, hold the collar or harness gently for one second, then release. Success looks like your dog returning even with light outdoor interest nearby.",
    "tip": "Safety first: use fenced areas or a long line outside.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-6",
    "program_id": "recall-come-when-called",
    "step_number": 6,
    "title": "Add safe distance",
    "instruction": "Let your dog move farther away on a long line, then call when attention is not fully locked on something else. Reward close arrival and release again. Success looks like three recalls from a longer distance with a loose line.",
    "tip": "Build distance only when the shorter version is easy.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "recall-come-when-called-7",
    "program_id": "recall-come-when-called",
    "step_number": 7,
    "title": "Mild distraction recalls",
    "instruction": "Choose easy distractions, such as leaves or quiet smells, and call before your dog is fully absorbed. Reward heavily for turning away and coming back. Success looks like your dog choosing you over one mild distraction.",
    "tip": "Keep the reward better than the distraction while the skill is growing.",
    "estimated_duration_min": 15,
    "created_at": null
  },
  {
    "id": "calm-greetings-1",
    "program_id": "calm-greetings",
    "step_number": 1,
    "title": "Reward four paws",
    "instruction": "Stand near your dog and reward when all four paws are on the floor. If your dog jumps, pause quietly and reward the next grounded moment. Success looks like your dog offering four paws down for three greetings.",
    "tip": "Deliver rewards low so your dog does not need to bounce upward.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "calm-greetings-2",
    "program_id": "calm-greetings",
    "step_number": 2,
    "title": "Practice with family",
    "instruction": "Have a familiar person approach slowly while you reward four paws on the floor. The helper turns sideways and stays calm. Success looks like your dog greeting one familiar person without jumping.",
    "tip": "Ask helpers to keep hands low and voices soft during early practice.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "calm-greetings-3",
    "program_id": "calm-greetings",
    "step_number": 3,
    "title": "Add a door routine",
    "instruction": "Before opening the door, scatter a few treats away from the entry path. Let your dog find the treats while the person enters calmly. Success looks like your dog staying busy and grounded as the door opens.",
    "tip": "Prepare treats before the doorbell or planned knock.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "calm-greetings-4",
    "program_id": "calm-greetings",
    "step_number": 4,
    "title": "Use distance resets",
    "instruction": "If excitement rises, guide your dog farther from the person and reward calm looking. Move closer only when the body softens again. Success looks like your dog settling faster after one reset.",
    "tip": "Distance is not failure; it is a way to help your dog think.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "calm-greetings-5",
    "program_id": "calm-greetings",
    "step_number": 5,
    "title": "Practice on walks",
    "instruction": "Ask for a simple check-in before greeting someone outside. If your dog can keep four paws down, allow a brief hello and reward after. Success looks like one short outdoor greeting without jumping.",
    "tip": "Skip greetings when the sidewalk is too crowded or exciting.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "calm-greetings-6",
    "program_id": "calm-greetings",
    "step_number": 6,
    "title": "Add short guest visits",
    "instruction": "Set up a five-minute visit with one calm guest and reward settled moments near you. End the visit before excitement builds too high. Success looks like your dog returning to you for rewards during the visit.",
    "tip": "Short successful visits teach more than long chaotic ones.",
    "estimated_duration_min": 15,
    "created_at": null
  },
  {
    "id": "crate-training-1",
    "program_id": "crate-training",
    "step_number": 1,
    "title": "Explore the open crate",
    "instruction": "Leave the crate door open and place treats just inside the entrance. Let your dog choose to investigate without closing the door. Success looks like your dog stepping toward or into the crate with a loose body.",
    "tip": "Put the crate near normal family activity, not isolated at first.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "crate-training-2",
    "program_id": "crate-training",
    "step_number": 2,
    "title": "Feed near the crate",
    "instruction": "Place a meal or stuffed food toy near the crate opening, then gradually move it just inside. Keep the door open so the crate predicts good things. Success looks like your dog eating comfortably near or inside the crate.",
    "tip": "Move the food farther inside only when the current spot is easy.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "crate-training-3",
    "program_id": "crate-training",
    "step_number": 3,
    "title": "Step inside and out",
    "instruction": "Toss a treat into the crate and let your dog enter, eat, and leave. Add a second treat after entry so staying inside briefly pays off. Success looks like your dog entering and turning around comfortably.",
    "tip": "Use a mat or soft bedding if your dog prefers more traction.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "crate-training-4",
    "program_id": "crate-training",
    "step_number": 4,
    "title": "Close the door briefly",
    "instruction": "When your dog is eating inside, close the door for one second and open it again before concern appears. Reward calm behavior after the door opens. Success looks like three calm one-second door closures.",
    "tip": "Keep early door closures so short they feel almost boring.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "crate-training-5",
    "program_id": "crate-training",
    "step_number": 5,
    "title": "Add quiet duration",
    "instruction": "Give a safe chew or food toy in the crate and sit nearby while your dog settles. Open the door while your dog is still calm. Success looks like one relaxed minute in the crate with you nearby.",
    "tip": "High-energy puppies may need potty time and a short play session first.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "crate-training-6",
    "program_id": "crate-training",
    "step_number": 6,
    "title": "Practice calm exits",
    "instruction": "Open the crate door slightly, then reward if your dog waits instead of rushing out. Say Free and invite your dog out calmly. Success looks like your dog pausing at the open door before exiting.",
    "tip": "A calm exit keeps the crate routine predictable from start to finish.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "reactivity-management-1",
    "program_id": "reactivity-management",
    "step_number": 1,
    "title": "Find comfortable distance",
    "instruction": "Notice how far away your dog can see a trigger and still take treats or look back at you. Start practice at that distance or farther. Success looks like your dog observing without barking, lunging, or freezing.",
    "tip": "Choose wide spaces where you can add distance easily.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "reactivity-management-2",
    "program_id": "reactivity-management",
    "step_number": 2,
    "title": "Mark calm looking",
    "instruction": "When your dog looks at the trigger calmly, mark and feed before intensity rises. Let your dog look again and reward another calm glance. Success looks like two calm looks followed by easy treat taking.",
    "tip": "Use soft food that is fast to eat so your dog can keep thinking.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "reactivity-management-3",
    "program_id": "reactivity-management",
    "step_number": 3,
    "title": "Pair triggers with rewards",
    "instruction": "At a comfortable distance, feed a reward each time the trigger appears. Stop feeding when the trigger disappears. Success looks like your dog noticing the trigger and then checking for the reward.",
    "tip": "This is pattern building, not a test, so keep setups easy.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "reactivity-management-4",
    "program_id": "reactivity-management",
    "step_number": 4,
    "title": "Practice retreat turns",
    "instruction": "Say This way, turn with your dog, and reward after you create space. Practice when the environment is easy before using it in real moments. Success looks like your dog following the turn without leash tension.",
    "tip": "A cheerful retreat protects progress and keeps walks calmer.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "reactivity-management-5",
    "program_id": "reactivity-management",
    "step_number": 5,
    "title": "Add a simple pattern game",
    "instruction": "Count one-two-three out loud and feed on three while moving away from the trigger. Repeat the same rhythm several times. Success looks like your dog following the pattern and taking food while leaving space.",
    "tip": "Predictable patterns can help dogs settle when the world feels busy.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "reactivity-management-6",
    "program_id": "reactivity-management",
    "step_number": 6,
    "title": "Shorten recovery time",
    "instruction": "After a surprise trigger, move away and reward any check-in or sniffing. Track how long it takes your dog to relax again. Success looks like your dog recovering faster than the last similar setup.",
    "tip": "Compare similar setups rather than judging every walk the same way.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "reactivity-management-7",
    "program_id": "reactivity-management",
    "step_number": 7,
    "title": "Track easier setups",
    "instruction": "Log the distance, trigger type, and reward that helped your dog stay calm. Repeat the easiest setup before increasing difficulty. Success looks like two sessions with the same comfortable pattern.",
    "tip": "Reliable easy wins are the foundation for harder environments.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "reactivity-management-8",
    "program_id": "reactivity-management",
    "step_number": 8,
    "title": "Build one closer step",
    "instruction": "Move slightly closer only after your dog succeeds at the current distance. Reward calm looking and use a retreat turn before intensity rises. Success looks like one closer setup that still feels manageable.",
    "tip": "Tiny changes protect confidence for both you and your dog.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "leave-it-drop-it-1",
    "program_id": "leave-it-drop-it",
    "step_number": 1,
    "title": "Trade for a treat",
    "instruction": "Offer a safe toy, then present a treat near your dog nose. When your dog releases the toy, mark, reward, and give the toy back. Success looks like your dog happily trading without guarding the item.",
    "tip": "Returning the toy teaches that releasing does not always end the fun.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "leave-it-drop-it-2",
    "program_id": "leave-it-drop-it",
    "step_number": 2,
    "title": "Add the drop cue",
    "instruction": "Say Drop once, then present the treat trade. Reward the release and offer the toy again when appropriate. Success looks like your dog releasing after the cue and before the treat reaches the mouth.",
    "tip": "Use low-value toys first so the trade is easy.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "leave-it-drop-it-3",
    "program_id": "leave-it-drop-it",
    "step_number": 3,
    "title": "Covered food leave it",
    "instruction": "Place food under your closed hand and wait quietly. Mark and reward from your other hand when your dog backs away or looks at you. Success looks like your dog moving away from the covered food three times.",
    "tip": "The reward should come from you, not from the covered food.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "leave-it-drop-it-4",
    "program_id": "leave-it-drop-it",
    "step_number": 4,
    "title": "Open-hand leave it",
    "instruction": "Show food on an open palm and close your hand if your dog moves toward it. Mark and reward from the other hand when your dog pauses or looks away. Success looks like your dog ignoring the open-hand food for two seconds.",
    "tip": "Keep your hand low and still so the picture is clear.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "leave-it-drop-it-5",
    "program_id": "leave-it-drop-it",
    "step_number": 5,
    "title": "Practice outdoor distractions",
    "instruction": "Use a safe item on the ground and cue Leave it before your dog reaches it. Reward turning away and move on together. Success looks like your dog passing one outdoor item without grabbing it.",
    "tip": "Start with boring outdoor items before practicing near food or wildlife smells.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "separation-comfort-1",
    "program_id": "separation-comfort",
    "step_number": 1,
    "title": "Create a settle station",
    "instruction": "Choose a bed, mat, or crate area and reward your dog for resting there while you stay nearby. Keep the session calm and short. Success looks like your dog choosing the station for one relaxed minute.",
    "tip": "Use this station outside departure practice so it feels safe and normal.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "separation-comfort-2",
    "program_id": "separation-comfort",
    "step_number": 2,
    "title": "Practice tiny departures",
    "instruction": "Step behind a doorway for one second, return, and reward calm behavior. Repeat only while your dog stays relaxed. Success looks like five one-second departures without pacing or vocalizing.",
    "tip": "Tiny starts are useful data, not a sign that progress is slow.",
    "estimated_duration_min": 8,
    "created_at": null
  },
  {
    "id": "separation-comfort-3",
    "program_id": "separation-comfort",
    "step_number": 3,
    "title": "Build door seconds",
    "instruction": "Move from one second to three seconds only if the shorter version stays calm. Return quietly and reward settled behavior. Success looks like your dog staying relaxed through three short door absences.",
    "tip": "Increase time in small steps rather than jumping to minutes.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "separation-comfort-4",
    "program_id": "separation-comfort",
    "step_number": 4,
    "title": "Add real-life cues",
    "instruction": "Pick up keys or put on shoes, then sit back down and reward calm behavior. Keep these cues separate from real departures at first. Success looks like your dog noticing the cue without following you anxiously.",
    "tip": "Practice one cue at a time so you can see what changes.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "separation-comfort-5",
    "program_id": "separation-comfort",
    "step_number": 5,
    "title": "Practice short returns",
    "instruction": "Leave for a very short duration your dog has already handled well, then return calmly. Reward settled behavior after a few quiet seconds. Success looks like your dog staying calm before and after your return.",
    "tip": "Low-key returns help departures feel routine.",
    "estimated_duration_min": 10,
    "created_at": null
  },
  {
    "id": "separation-comfort-6",
    "program_id": "separation-comfort",
    "step_number": 6,
    "title": "Extend after calm reps",
    "instruction": "Add a few seconds only after two calm repetitions at the current duration. If your dog shows concern, return to the last easy duration. Success looks like your dog completing a slightly longer absence with the same relaxed body.",
    "tip": "Progress is based on comfort signals, not the calendar.",
    "estimated_duration_min": 12,
    "created_at": null
  },
  {
    "id": "separation-comfort-7",
    "program_id": "separation-comfort",
    "step_number": 7,
    "title": "Track the best window",
    "instruction": "Log the duration, setup, and time of day for the easiest departures. Repeat the best window before adding harder details. Success looks like a repeatable alone-time setup your dog handles calmly.",
    "tip": "Patterns help you choose the kindest next step.",
    "estimated_duration_min": 8,
    "created_at": null
  }
];
