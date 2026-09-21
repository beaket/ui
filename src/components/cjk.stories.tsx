import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Alert } from "./alert";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Switch } from "./switch";
import { Table } from "./table";

/**
 * CJK is not a variant of the Latin case — it is the case that sets the floor.
 * Hangul packs two or three jamo into one em and kanji can carry a dozen
 * strokes, so both collapse below 12px where Latin at the same size still
 * reads. These stories exist so that floor has a rendered baseline: nothing
 * else in the set contains a Hangul or Kana glyph, which is why a type scale
 * that was unusable in Korean stayed green through 357 visual snapshots.
 *
 * Every wrapper sets `lang` on purpose. It selects the script's own font stack
 * and, for Korean, `word-break: keep-all` — without which a line wraps
 * mid-eojeol. Setting `lang` is the consuming application's job, and these
 * stories are also the demonstration of that requirement.
 */
export default {
  title: "Design/CJK",
  parameters: { layout: "padded" },
} satisfies Meta;

type Story = StoryObj;

/** A real Korean screen: the composition the design contract describes. */
export const Korean: Story = {
  render: () => (
    <div lang="ko" className="flex max-w-3xl flex-col gap-4">
      <Alert variant="warning" title="결제 실패">
        결제에 실패한 주문이 3건 있습니다. 재시도하거나 주문을 취소할 수 있습니다.
      </Alert>

      <Card>
        <Card.Header>
          <Card.Title>주문 관리</Card.Title>
          <Card.Description>최근 30일 동안 접수된 주문 1,284건</Card.Description>
          <Card.Action>
            <Button size="sm">내보내기</Button>
          </Card.Action>
        </Card.Header>

        <Input placeholder="주문번호 또는 고객명 검색" aria-label="주문 검색" />

        <Card.Section>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>주문번호</Table.Head>
                <Table.Head>고객</Table.Head>
                <Table.Head>상태</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>ORD-24819</Table.Cell>
                <Table.Cell>김민서</Table.Cell>
                <Table.Cell>
                  <Badge>배송완료</Badge>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>ORD-24820</Table.Cell>
                <Table.Cell>박지후</Table.Cell>
                <Table.Cell>
                  <Badge variant="outline">결제대기</Badge>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </Card.Section>

        <Card.Footer className="gap-7">
          <label htmlFor="cjk-ko-failed" className="flex min-h-11 items-center gap-2 text-sm">
            <Checkbox id="cjk-ko-failed" defaultChecked /> 실패한 주문만 보기
          </label>
          <label htmlFor="cjk-ko-notify" className="flex min-h-11 items-center gap-2 text-sm">
            <Switch id="cjk-ko-notify" /> 알림 받기
          </label>
        </Card.Footer>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("주문 관리");

    // 14px carries the interface in every script, not only in Latin. Asserted
    // on the description rather than the title, because Card.Title deliberately
    // inherits its size from the surrounding text and so measures whatever the
    // host's ambient size is.
    const description = canvas.getByText(/최근 30일/);
    await expect(getComputedStyle(description).fontSize).toBe("14px");

    // 12px is the label floor — below it Hangul jamo collapse into each other.
    await expect(getComputedStyle(canvas.getByText("배송완료")).fontSize).toBe("12px");

    // Korean breaks between words. Without keep-all a line wraps mid-eojeol,
    // which reads to a Korean reader the way a mid-syllable break reads in
    // English — and it is inert unless `lang` is set, so this asserts both.
    await expect(getComputedStyle(title).wordBreak).toBe("keep-all");

    // Nothing clips: the deeper glyph body must still sit inside its line box.
    for (const el of [title, canvas.getByText("배송완료")]) {
      await expect(el.scrollHeight - el.clientHeight).toBeLessThanOrEqual(0);
    }
  },
};

/** The same system in Japanese, which must not borrow Korean glyph forms. */
export const Japanese: Story = {
  render: () => (
    <div lang="ja" className="flex max-w-3xl flex-col gap-4">
      <Alert variant="note" title="議事録の設定">
        変更内容は次回の同期時に反映されます。読み取り専用の項目は編集できません。
      </Alert>

      <Card>
        <Card.Header>
          <Card.Title>注文管理</Card.Title>
          <Card.Description>過去30日間に受け付けた注文 1,284件</Card.Description>
        </Card.Header>

        <Input defaultValue="読み取り専用の値" readOnly aria-label="読み取り専用" />

        <Card.Footer className="gap-7">
          <label htmlFor="cjk-ja-failed" className="flex min-h-11 items-center gap-2 text-sm">
            <Checkbox id="cjk-ja-failed" defaultChecked /> 失敗した注文のみ表示
          </label>
          <Badge variant="outline">支払待ち</Badge>
        </Card.Footer>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByText("注文管理");

    await expect(getComputedStyle(canvas.getByText(/過去30日間/)).fontSize).toBe("14px");

    // Japanese must not fall through to a Korean face. A Korean family such as
    // Apple SD Gothic Neo also covers the CJK ideograph block, so listing it
    // first made kanji render in Korean national glyph forms — measurably, at a
    // different advance width. `lang` is what routes each script to its own
    // stack, so assert the routing rather than the resolved family name.
    await expect(getComputedStyle(title).wordBreak).toBe("normal");
    await expect(title.closest("[lang]")?.getAttribute("lang")).toBe("ja");
  },
};

/** The three scripts at the two sizes that carry the whole interface. */
export const TypeFloor: Story = {
  render: () => (
    <table className="text-sm">
      <thead>
        <tr className="text-fg-subtle text-xs">
          <th className="p-2 text-left font-medium">Step</th>
          <th className="p-2 text-left font-medium">English</th>
          <th className="p-2 text-left font-medium">한국어</th>
          <th className="p-2 text-left font-medium">日本語</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="text-fg-muted p-2 text-xs">12px · labels</td>
          <td className="p-2 text-xs">Order history</td>
          <td className="p-2 text-xs" lang="ko">
            주문 내역 확인
          </td>
          <td className="p-2 text-xs" lang="ja">
            注文履歴の確認
          </td>
        </tr>
        <tr>
          <td className="text-fg-muted p-2 text-xs">14px · interface</td>
          <td className="p-2">Settings updated</td>
          <td className="p-2" lang="ko">
            설정을 변경했습니다
          </td>
          <td className="p-2" lang="ja">
            設定を変更しました
          </td>
        </tr>
      </tbody>
    </table>
  ),
};
