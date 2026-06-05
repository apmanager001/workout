## Stack

NEXTjs- installed already
daisyui- installed already
lucide-react- installed already
tanstack- installed already
mongodb- installed already
mongoose - installed already
typescript- installed already


current setup is a template we will change with this new project, a workout app that allows the user to log all their workouts

## Dashboard Page
only accessible when user is logged in


7 day week Sunday - Saturday vertically, 
under each day there is a list of workouts the user added

workouts 
- can be reordered and save the order in db
- can be drag and dropped for order or to change days
- after each workout is an add workout button. border will be dotted from daisyui, opens add workout modal

add workout modal
- date workout gets added to
- a few examples to choose from
 - search for a workout by muscle, name of workout or type
 - adds the workout to that specific day

drawer for each workout
 - user can click the name of workout and a drawer pops out on right that says name, type, target muscle, icon for equipment using lucide react or another icon library if needed, description and embeded youtube video

drawer for a workout for specific day
- this will allow a user to log reps
- depending on workout type, it changes the form to fill out
	- type: weight, number of reps, weight for each rep and notes for each workout for that day
		- depending number put in reps it populates inputs for weight for each rep
	- type: cardio, minutes, amount 
- submit button
- if this workout for the day was already submitted it populates the info

## Settings Page
only accessible when user is logged in


## Admin Page
 users will have an admin field that defaults to false, i will manually turn the admin to true
 admin can add and edit different workouts in the database, this way admin can quickly add workouts users can use.

## Homepage
splash component at top
list of 10 workouts that link to their own page, same as the workout drawer, so lets make workout drawer its own component that can be used in both

## UI
default to dark mode
currently color theme is in global.css lets update it to a pleasant dark mode color theme
should be mobile focused but also look good on web. 
if you can think of additional features feel free to add them, ask any questions to make this efficient and look great
make sure non logged in pages are considering seo
need header and footer filled out with info from these changes
## Database

# Model for Workout info
 - Workout Name
 - type
 - equipment - array of different equipment
 - Target Muscle is an array of different muscles
 - Description
 - youtube


## Example of workout data


| Type   | Workout                          | Equipment needed                      | Target Muscle                   | Description                                                                                                                  | Youtube |
| ------ | -------------------------------- | ------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| weight | Barbell Flat Bench Press         | Bar + Rack                            | Chest, Front Shoulders, Triceps | Primary chest strength builder. Keep your feet flat and press your upper back into the bench.                                |         |
| weight | Dumbbell Suitcase Squat          | dumbells                              | Quads, Glutes, Grip Strength    | Hold dumbbells at your sides like suitcases. Lowers your center of gravity for great balance and less back strain.           |         |
|        | Dumbbell Single-Arm Row          | Dumbbell + Bench                      | Upper Back, Lats, Biceps        | Keep your torso flat and parallel to the bench. Pull the dumbbell back toward your hip.                                      |         |
|        | Dumbbell Glute Thrust            | Dumbell                               | Glutes, Hamstrings              | Sit on the floor with upper back against the bench, place weight on hips, and drive hips up to the ceiling.                  |         |
| cardio | Heavy Bag HIIT Intervals         | Punching Bag                          | Cardio, Core, Shoulder Stamina  | Throw hard, fast punches non-stop for 30 seconds to spike your heart rate and torch calories.                                |         |
|        | Barbell Bent-Over Row            | Bar                                   | Mid Back, Lats, Core            | Main upper body pulling movement. Hinge at the hips, keep back flat, and pull the bar to your lower stomach.                 |         |
|        | Incline Dumbbell Press           | dumbells + Incline Bench              | Upper Chest, Front Shoulders    | Set the bench to a 30-45 degree angle. Focus on a deep stretch at the bottom of the movement.                                |         |
|        | Dumbbell Reverse Lunges          | Dumbell                               | Quads, Glutes, Hamstrings       | Step backward into the lunge. This dynamic movement is highly effective and much safer on the knees.                         |         |
|        | Dumbbell Seated Shoulder Press   | Dumbell + flat bench or incline bench | Shoulders (Deltoids), Triceps   | Sit fully upright with back supported. Press the dumbbells straight overhead without arching your lower back.                |         |
|        | Heavy Bag Endurance Round        | Punching Bag                          | Stamina, Footwork, Cardio       | Keep a steady, rhythmic pace for the full 3 minutes. Focus on continuous movement and light, snappy jabs.                    |         |
|        | Barbell Decline Bench Press      | bar + Rack                            | Lower Chest, Triceps            | Tackles the lower chest. The slight decline provides a strong mechanical advantage to push good weight safely.               |         |
|        | Dumbbell Static Split Squat      | dumbell                               | Quads, Glutes                   | Take a step back into a lunge stance and keep your feet glued there. Just move straight up and down for all reps.            |         |
|        | Dumbbell Bicep Curls             | dumbell                               | Biceps, Forearms                | Keep your elbows tucked tightly to your sides. Focus on squeezing the muscle at the top without swinging.                    |         |
|        | Lying Dumbbell Tricep Extensions | dumbell + flat bench                  | Triceps                         | Also known as skull crushers. Keep your elbows pointing at the ceiling and lower the weights under control toward your ears. |         |



