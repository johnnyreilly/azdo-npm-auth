import os from 'os';
import path from 'path';

export function getNpmrcPath(customPath?: string): string {
    if (customPath) {
        return path.resolve(customPath);
    }
    
    // Get the user's home directory in a cross-platform way
    const homeDir = os.homedir();
    return path.join(homeDir, '.npmrc');
} 