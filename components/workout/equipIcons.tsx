import {
  Dumbbell,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";
import { JSX } from "react";
import { IoIosFitness } from "react-icons/io";
import { GiWeightLiftingUp, GiPunchingBag } from "react-icons/gi";
import { MdOutlineFitnessCenter } from "react-icons/md";

const EQUIP_ICON_MAP: Record<string, JSX.Element> = {
  dumbbell: <Dumbbell className="w-4 h-4" />,
  dumbbells: <Dumbbell className="w-4 h-4" />,

  bar: <IoIosFitness className="w-4 h-4" />,
  barbell: <Dumbbell className="w-4 h-4" />,
  "punching bag": <GiPunchingBag className="w-4 h-4" />,

  rack: <GiWeightLiftingUp className="w-4 h-4" />,

  bench: <RectangleHorizontal className="w-4 h-4" />,
  "flat bench": <RectangleHorizontal className="w-4 h-4" />,
  "incline bench": <RectangleVertical className="w-4 h-4" />,
  "decline bench": <RectangleVertical className="w-4 h-4 rotate-180" />,

  default: <MdOutlineFitnessCenter className="w-4 h-4" />,
};
type EquipIconsProps = {
  equipment: string[];
};


const EquipIcons = ({ equipment }: EquipIconsProps) => {
  if (!equipment || equipment.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {equipment.map((equip, index) => {
        const key = equip.toLowerCase().trim();
        const Icon = EQUIP_ICON_MAP[key] || EQUIP_ICON_MAP.default;

        return (
          <span
            key={equip + index}
            className="tooltip tooltip-right badge badge-xs md:badge-md badge-outline border-accent/20 bg-accent/5 text-accent"
            data-tip={equip}
          >
            {Icon}
          </span>
        );
      })}
    </div>
  );
};

export default EquipIcons;
