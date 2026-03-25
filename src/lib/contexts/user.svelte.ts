import { createContext } from 'svelte';
import type { User } from 'better-auth';

export const [getUserContext, setUserContext] = createContext<() => User>();
