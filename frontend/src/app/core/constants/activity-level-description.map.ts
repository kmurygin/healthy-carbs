import {ActivityLevel} from "../models/enum/activity-level.enum";

export const ActivityLevelDescriptionMap: Readonly<Record<ActivityLevel, string>> = {
  [ActivityLevel.SEDENTARY] : 'no exercise',
  [ActivityLevel.LIGHT] : '1-3 days/week',
  [ActivityLevel.MODERATE] : '3-5 days/week',
  [ActivityLevel.HIGH] : '6-7 days/week',
  [ActivityLevel.EXTREME] : 'intense daily exercise',
}
