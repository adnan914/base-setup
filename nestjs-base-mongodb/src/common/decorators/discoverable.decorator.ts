import 'reflect-metadata';
export const DISCOVERABLE_KEY = 'app:discoverable';

export function Discoverable(tag?: string): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata(DISCOVERABLE_KEY, tag || target.name, target);
    };
}
