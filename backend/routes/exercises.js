const express = require('express');
const router = express.Router();

// Comprehensive exercise database
const EXERCISES = [
  // CHEST
  { id: 'bench_press', name: 'Bench Press', category: 'chest', equipment: 'barbell', level: 'intermediate', muscles: ['pectorals', 'triceps', 'front deltoids'], steps: ['Lie flat on bench, feet on floor', 'Grip bar slightly wider than shoulder-width', 'Unrack bar and hold directly above chest', 'Lower bar slowly to mid-chest, 3 seconds down', 'Press bar up explosively, fully extend arms', 'Repeat without locking out elbows'], tips: 'Keep shoulder blades retracted and arched lower back', calories_per_set: 8, gif: '🏋️' },
  { id: 'push_up', name: 'Push Up', category: 'chest', equipment: 'bodyweight', level: 'beginner', muscles: ['pectorals', 'triceps', 'core'], steps: ['Start in plank position, hands slightly wider than shoulder-width', 'Body forms straight line from head to heels', 'Lower chest toward floor, elbows at 45 degrees', 'Push back up until arms fully extended', 'Squeeze chest at top'], tips: 'Do not let hips sag or pike up', calories_per_set: 5, gif: '💪' },
  { id: 'incline_dumbbell', name: 'Incline Dumbbell Press', category: 'chest', equipment: 'dumbbells', level: 'intermediate', muscles: ['upper chest', 'front deltoids', 'triceps'], steps: ['Set bench to 30-45 degree incline', 'Lie back, hold dumbbells at chest level', 'Press dumbbells up and slightly inward', 'Lower slowly with control', 'Keep constant tension throughout'], tips: 'Do not flare elbows excessively', calories_per_set: 9, gif: '🏋️' },
  { id: 'dips', name: 'Chest Dips', category: 'chest', equipment: 'bodyweight', level: 'intermediate', muscles: ['lower chest', 'triceps'], steps: ['Grip parallel bars, arms straight', 'Lean forward slightly to target chest', 'Lower body until shoulders below elbows', 'Push back up without fully locking out', 'Keep controlled, slow motion'], tips: 'Lean forward more = more chest activation', calories_per_set: 10, gif: '🤸' },
  
  // BACK
  { id: 'pull_up', name: 'Pull Up', category: 'back', equipment: 'bodyweight', level: 'intermediate', muscles: ['lats', 'biceps', 'rhomboids'], steps: ['Hang from bar, palms facing away', 'Engage core, pull shoulder blades down', 'Pull elbows toward hips', 'Chin clears the bar', 'Lower slowly to full hang'], tips: 'Avoid kipping - use full body control', calories_per_set: 12, gif: '🏋️' },
  { id: 'deadlift', name: 'Deadlift', category: 'back', equipment: 'barbell', level: 'advanced', muscles: ['glutes', 'hamstrings', 'lower back', 'traps'], steps: ['Stand with feet hip-width, bar over mid-foot', 'Hinge at hips, grip bar with hands outside shins', 'Chest tall, neutral spine, big breath in', 'Push floor away to stand up with bar', 'Hinge at hips to lower bar back down'], tips: 'CRITICAL: Never round lower back - brace core hard', calories_per_set: 15, gif: '🏋️' },
  { id: 'bent_over_row', name: 'Bent Over Row', category: 'back', equipment: 'barbell', level: 'intermediate', muscles: ['lats', 'rhomboids', 'traps', 'biceps'], steps: ['Stand with hip-width stance', 'Hinge forward at 45-degree angle', 'Pull bar to lower chest/upper abs', 'Squeeze shoulder blades together at top', 'Lower with control'], tips: 'Keep back flat, do not round', calories_per_set: 10, gif: '🏋️' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', category: 'back', equipment: 'cable', level: 'beginner', muscles: ['lats', 'biceps', 'rear deltoids'], steps: ['Sit with thighs under pad, grip wide', 'Lean back slightly', 'Pull bar to upper chest', 'Hold and squeeze lats for 1 second', 'Slowly return to start'], tips: 'Pull with elbows, not hands', calories_per_set: 8, gif: '🏋️' },

  // LEGS
  { id: 'squat', name: 'Barbell Squat', category: 'legs', equipment: 'barbell', level: 'intermediate', muscles: ['quadriceps', 'glutes', 'hamstrings', 'core'], steps: ['Bar on upper traps, feet shoulder-width', 'Brace core, take big breath', 'Push knees out as you descend', 'Lower until thighs parallel or below', 'Drive through heels to stand'], tips: 'Knees should track over toes, not cave in', calories_per_set: 15, gif: '🏋️' },
  { id: 'goblet_squat', name: 'Goblet Squat', category: 'legs', equipment: 'dumbbells', level: 'beginner', muscles: ['quadriceps', 'glutes', 'core'], steps: ['Hold dumbbell vertically at chest', 'Feet shoulder-width, toes slightly out', 'Sit back and down, elbows inside knees', 'Drive through heels to stand', 'Keep chest up throughout'], tips: 'Great for learning squat mechanics', calories_per_set: 10, gif: '🏋️' },
  { id: 'lunges', name: 'Walking Lunges', category: 'legs', equipment: 'bodyweight', level: 'beginner', muscles: ['quadriceps', 'glutes', 'hamstrings'], steps: ['Stand tall with feet together', 'Step forward with one leg', 'Lower back knee toward floor', 'Front thigh should be parallel to floor', 'Drive forward off front heel', 'Alternate legs as you walk'], tips: 'Keep front knee behind toes', calories_per_set: 8, gif: '🚶' },
  { id: 'leg_press', name: 'Leg Press', category: 'legs', equipment: 'machine', level: 'beginner', muscles: ['quadriceps', 'glutes', 'hamstrings'], steps: ['Sit in machine, feet shoulder-width on plate', 'Release safety handles', 'Lower platform until 90-degree knee bend', 'Press platform back up without locking knees', 'Keep feet flat throughout'], tips: 'Do not let lower back round off seat', calories_per_set: 12, gif: '🦵' },
  { id: 'rdl', name: 'Romanian Deadlift', category: 'legs', equipment: 'barbell', level: 'intermediate', muscles: ['hamstrings', 'glutes', 'lower back'], steps: ['Hold bar at hips, soft knee bend', 'Hinge forward keeping bar close to legs', 'Feel hamstring stretch at bottom', 'Drive hips forward to stand', 'Squeeze glutes at top'], tips: 'This is a HINGE, not a squat - minimal knee bend', calories_per_set: 10, gif: '🏋️' },
  { id: 'calf_raise', name: 'Calf Raise', category: 'legs', equipment: 'bodyweight', level: 'beginner', muscles: ['calves', 'soleus'], steps: ['Stand with ball of foot on edge of step', 'Lower heel below step level', 'Rise up on ball of foot as high as possible', 'Hold for 1 second at top', 'Lower slowly for 3 seconds'], tips: 'Slow lowering is key for calf development', calories_per_set: 5, gif: '🦵' },

  // SHOULDERS
  { id: 'overhead_press', name: 'Overhead Press', category: 'shoulders', equipment: 'barbell', level: 'intermediate', muscles: ['front deltoids', 'triceps', 'upper traps'], steps: ['Grip bar just outside shoulder width', 'Bar rests on front shoulders', 'Press bar overhead, clear the head', 'Lock out overhead, arms fully extended', 'Lower to starting position'], tips: 'Brace core to protect lower back', calories_per_set: 10, gif: '🏋️' },
  { id: 'lateral_raise', name: 'Lateral Raise', category: 'shoulders', equipment: 'dumbbells', level: 'beginner', muscles: ['lateral deltoids'], steps: ['Hold dumbbells at sides, slight elbow bend', 'Raise arms out to sides', 'Stop at shoulder height - do not go higher', 'Lower slowly for 3 seconds', 'Do not use momentum or swing'], tips: 'Lighter weight, perfect form beats heavy + swing', calories_per_set: 6, gif: '💪' },
  { id: 'face_pull', name: 'Face Pull', category: 'shoulders', equipment: 'cable', level: 'beginner', muscles: ['rear deltoids', 'rhomboids', 'rotator cuff'], steps: ['Set cable at head height', 'Grip rope handles with both hands', 'Pull rope toward face, elbows flared high', 'Hold for 1 second, squeeze rear delts', 'Slowly release'], tips: 'Essential for shoulder health and posture', calories_per_set: 6, gif: '🏋️' },

  // ARMS
  { id: 'bicep_curl', name: 'Dumbbell Curl', category: 'arms', equipment: 'dumbbells', level: 'beginner', muscles: ['biceps', 'brachialis'], steps: ['Stand with dumbbells at sides, palms forward', 'Keep elbows at sides (fixed position)', 'Curl dumbbells toward shoulders', 'Hold peak contraction for 1 second', 'Lower slowly for 3 seconds'], tips: 'Do not swing or use back momentum', calories_per_set: 5, gif: '💪' },
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', category: 'arms', equipment: 'cable', level: 'beginner', muscles: ['triceps'], steps: ['Grip rope/bar at cable station', 'Keep elbows at sides, fixed position', 'Push attachment down until arms extended', 'Squeeze triceps for 1 second', 'Slowly return to 90 degrees'], tips: 'Elbows must stay fixed - they are the pivot', calories_per_set: 5, gif: '💪' },
  { id: 'hammer_curl', name: 'Hammer Curl', category: 'arms', equipment: 'dumbbells', level: 'beginner', muscles: ['biceps', 'brachialis', 'forearms'], steps: ['Hold dumbbells with neutral grip (thumbs up)', 'Keep elbows at sides', 'Curl toward shoulder', 'Lower slowly'], tips: 'Builds forearm thickness along with biceps', calories_per_set: 5, gif: '💪' },
  { id: 'skull_crusher', name: 'Skull Crusher', category: 'arms', equipment: 'barbell', level: 'intermediate', muscles: ['triceps (all 3 heads)'], steps: ['Lie on bench, bar over chest', 'Lower bar toward forehead by bending elbows', 'Keep upper arms vertical, elbows pointing up', 'Extend arms back to starting position', 'Do not lock out fully'], tips: 'Use EZ-bar to reduce wrist strain', calories_per_set: 7, gif: '🏋️' },

  // CORE
  { id: 'plank', name: 'Plank', category: 'core', equipment: 'bodyweight', level: 'beginner', muscles: ['core', 'transverse abdominis', 'glutes'], steps: ['Forearms on floor, elbows under shoulders', 'Body forms straight line from head to heels', 'Engage core and glutes hard', 'Breathe normally', 'Hold for prescribed time'], tips: 'Quality over duration - stop when form breaks', calories_per_set: 3, gif: '🤸' },
  { id: 'crunches', name: 'Crunches', category: 'core', equipment: 'bodyweight', level: 'beginner', muscles: ['rectus abdominis'], steps: ['Lie on back, knees bent, feet flat', 'Hands behind head or on chest', 'Curl shoulders off floor using abs', 'Hold for 1 second at top', 'Lower slowly without fully relaxing'], tips: 'Do not pull on neck - use abs to lift', calories_per_set: 4, gif: '🤸' },
  { id: 'russian_twist', name: 'Russian Twist', category: 'core', equipment: 'bodyweight', level: 'beginner', muscles: ['obliques', 'core'], steps: ['Sit on floor, knees bent, feet slightly elevated', 'Lean back 45 degrees', 'Twist torso side to side', 'Touch hands to floor on each side', 'Keep controlled movement'], tips: 'Add weight plate or medicine ball for more challenge', calories_per_set: 5, gif: '🤸' },
  { id: 'leg_raise', name: 'Hanging Leg Raise', category: 'core', equipment: 'bodyweight', level: 'intermediate', muscles: ['lower abs', 'hip flexors', 'core'], steps: ['Hang from pull-up bar', 'Keep slight bend in knees', 'Raise legs to 90 degrees or higher', 'Lower slowly without swinging', 'Keep core engaged throughout'], tips: 'Avoid excessive swinging - use core to control', calories_per_set: 7, gif: '🤸' },

  // CARDIO
  { id: 'running', name: 'Running', category: 'cardio', equipment: 'none', level: 'beginner', muscles: ['legs', 'cardiovascular system'], steps: ['Warm up with 5 min easy walk', 'Land on midfoot, not heel', 'Keep upright posture, slight forward lean', 'Arms bent at 90 degrees, relaxed', 'Breathe rhythmically (2 steps in, 2 steps out)'], tips: 'Start with run/walk intervals if new', calories_per_set: 60, gif: '🏃' },
  { id: 'jump_rope', name: 'Jump Rope', category: 'cardio', equipment: 'rope', level: 'beginner', muscles: ['calves', 'cardiovascular', 'coordination'], steps: ['Hold handles at hip height', 'Jump with both feet, slight knee bend', 'Land softly on balls of feet', 'Wrists rotate the rope, not arms', 'Start slow, build rhythm'], tips: 'Even 10 minutes burns 100+ calories', calories_per_set: 15, gif: '⚡' },
  { id: 'burpee', name: 'Burpee', category: 'cardio', equipment: 'bodyweight', level: 'intermediate', muscles: ['full body', 'cardiovascular'], steps: ['Stand tall', 'Squat down, place hands on floor', 'Jump feet back to plank position', 'Perform a push-up (optional)', 'Jump feet back to squat position', 'Jump up with arms overhead'], tips: 'One of the most effective full-body moves', calories_per_set: 12, gif: '⚡' },
  { id: 'cycling', name: 'Cycling', category: 'cardio', equipment: 'bike', level: 'beginner', muscles: ['quadriceps', 'hamstrings', 'cardiovascular'], steps: ['Adjust seat height so leg is 80% extended at bottom', 'Start at moderate resistance', 'Pedal with smooth circular motion', 'Keep cadence between 80-100 RPM', 'Breathe steadily throughout'], tips: 'Great low-impact alternative to running', calories_per_set: 45, gif: '🚴' },

  // FLEXIBILITY
  { id: 'downward_dog', name: 'Downward Dog', category: 'flexibility', equipment: 'none', level: 'beginner', muscles: ['hamstrings', 'calves', 'shoulders', 'back'], steps: ['Start on hands and knees', 'Lift hips up and back', 'Form inverted V shape with body', 'Press heels toward floor', 'Hold for 5 breaths', 'Walk feet in and out to loosen up'], tips: 'Bend knees if hamstrings are tight', calories_per_set: 2, gif: '🧘' },
  { id: 'hip_flexor_stretch', name: 'Hip Flexor Stretch', category: 'flexibility', equipment: 'none', level: 'beginner', muscles: ['hip flexors', 'psoas', 'quads'], steps: ['Kneel on one knee (lunge position)', 'Tuck pelvis under - posterior tilt', 'Feel stretch in front of rear hip', 'Raise arm on same side as rear leg', 'Hold for 30-60 seconds each side'], tips: 'ESSENTIAL for anyone who sits all day', calories_per_set: 1, gif: '🧘' },
  { id: 'chest_stretch', name: 'Doorway Chest Stretch', category: 'flexibility', equipment: 'none', level: 'beginner', muscles: ['pectorals', 'front deltoids', 'biceps tendon'], steps: ['Stand in doorway', 'Place forearms on door frame at 90 degrees', 'Step forward until chest stretch felt', 'Hold for 30 seconds', 'Vary arm height to target different chest areas'], tips: 'Counteracts the effects of prolonged sitting', calories_per_set: 1, gif: '🧘' },
];

// GET all exercises
router.get('/', (req, res) => {
  const { category, equipment, level, search } = req.query;
  let filtered = EXERCISES;
  
  if (category) filtered = filtered.filter(e => e.category === category);
  if (equipment) filtered = filtered.filter(e => e.equipment === equipment);
  if (level) filtered = filtered.filter(e => e.level === level);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(e => 
      e.name.toLowerCase().includes(s) || 
      e.muscles.some(m => m.toLowerCase().includes(s)) ||
      e.category.toLowerCase().includes(s)
    );
  }
  
  res.json({ exercises: filtered, total: filtered.length });
});

// GET single exercise
router.get('/:id', (req, res) => {
  const exercise = EXERCISES.find(e => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found.' });
  res.json({ exercise });
});

// GET categories
router.get('/meta/categories', (req, res) => {
  const categories = [...new Set(EXERCISES.map(e => e.category))];
  res.json({ categories });
});

module.exports = router;
module.exports.EXERCISES = EXERCISES;
