export const badgeType = (input: number) => {
  if (input < 0) {
    return 'moderateDecrease'
  }
  if (input > 0) {
    return 'moderateIncrease'
  } else {
    return 'unchanged'
  }
}
