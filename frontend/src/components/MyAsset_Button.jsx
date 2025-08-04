import { Button } from './Button';

export default function MyAsset_Button() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">🧪 버튼 테스트</h1>
      <Button>기본 버튼</Button>
      <Button variant="secondary">보조 버튼</Button>
      <Button variant="danger" size="lg">위험 버튼</Button>
      <Button disabled>비활성 버튼</Button>
    </div>
  );
}