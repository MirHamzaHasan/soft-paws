import { type Href, Redirect } from 'expo-router';

export default function SafetyCenterAliasRoute() {
  return <Redirect href={'/safety' as Href} />;
}
