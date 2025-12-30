export function generateUiAvatarsUrl(firstName: string, lastName: string): string {
  const name = encodeURIComponent(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${name}`;
}

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName ? firstName.charAt(0) : '';
  const last = lastName ? lastName.charAt(0) : '';
  return (first + last).toUpperCase();
}
