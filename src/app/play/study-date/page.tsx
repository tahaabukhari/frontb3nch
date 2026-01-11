import type { Metadata } from 'next';
import StudyDateGame from '@/components/games/StudyDate4000/StudyDateGame';

export const metadata: Metadata = {
    title: 'StudyDate4000 | ParhaiPlay',
    description: 'A visual novel study buddy experience.',
};

export default function StudyDatePage() {
    return (
        <main className="w-full h-screen overflow-hidden">
            <StudyDateGame />
        </main>
    );
}
