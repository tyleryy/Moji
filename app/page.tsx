import JoinForm from './components/joinForm';

export default function Home() {

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-transparent via-transparent dark:from-transparent dark:via-transparent lg:static lg:size-auto lg:bg-none">
          <JoinForm/>
        </div>
      </div>
    </main>
  );
}
