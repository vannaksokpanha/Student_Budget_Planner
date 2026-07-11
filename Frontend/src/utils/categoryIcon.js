import {
  TbToolsKitchen2, TbCoffee, TbShoppingCart, TbHome, TbBus, TbDeviceGamepad2,
  TbSchool, TbSparkles, TbBolt, TbFirstAidKit, TbShirt, TbDeviceTv, TbPlane,
  TbPaw, TbGift, TbPigMoney, TbPhone, TbDots, TbTag
} from 'react-icons/tb';

// Maps a category name to an icon by keyword — categories are user-created
// free text, so we match loosely and case-insensitively. First hit wins;
// anything unrecognized falls back to a tag.
const RULES = [
  { keys: ['coffee', 'cafe'], Icon: TbCoffee },
  { keys: ['food', 'drink', 'dinner', 'lunch', 'breakfast', 'restaurant', 'snack', 'eat'], Icon: TbToolsKitchen2 },
  { keys: ['grocer', 'market', 'shopping'], Icon: TbShoppingCart },
  { keys: ['rent', 'home', 'house', 'dorm', 'housing'], Icon: TbHome },
  { keys: ['transport', 'bus', 'taxi', 'gas', 'fuel', 'car', 'travel pass', 'commute'], Icon: TbBus },
  { keys: ['entertain', 'movie', 'game', 'fun', 'music', 'concert'], Icon: TbDeviceGamepad2 },
  { keys: ['school', 'tuition', 'fee', 'book', 'edu', 'course'], Icon: TbSchool },
  { keys: ['skincare', 'beauty', 'cosmetic', 'makeup', 'hair'], Icon: TbSparkles },
  { keys: ['utilit', 'electric', 'water bill', 'internet', 'wifi'], Icon: TbBolt },
  { keys: ['phone', 'mobile'], Icon: TbPhone },
  { keys: ['health', 'medic', 'pharma', 'doctor', 'gym'], Icon: TbFirstAidKit },
  { keys: ['cloth', 'fashion', 'shoe', 'wear'], Icon: TbShirt },
  { keys: ['subscription', 'netflix', 'spotify', 'stream'], Icon: TbDeviceTv },
  { keys: ['travel', 'vacation', 'trip', 'flight'], Icon: TbPlane },
  { keys: ['pet', 'cat', 'dog'], Icon: TbPaw },
  { keys: ['gift', 'present', 'donat'], Icon: TbGift },
  { keys: ['saving', 'invest'], Icon: TbPigMoney },
  { keys: ['other', 'misc'], Icon: TbDots }
];

export const getCategoryIcon = (name) => {
  const n = (name || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.keys.some(k => n.includes(k))) return rule.Icon;
  }
  return TbTag;
};
