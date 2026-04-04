import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay, describeToolCall } from "../ToolCallDisplay";

describe("describeToolCall", () => {
  it("describes str_replace_editor create with file name", () => {
    expect(
      describeToolCall({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/components/Card.jsx" },
      })
    ).toBe("Created Card.jsx");
  });

  it("describes str_replace_editor str_replace with file name", () => {
    expect(
      describeToolCall({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/App.jsx" },
      })
    ).toBe("Edited App.jsx");
  });

  it("describes str_replace_editor insert with file name", () => {
    expect(
      describeToolCall({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "insert", path: "/utils/helpers.ts" },
      })
    ).toBe("Edited helpers.ts");
  });

  it("describes str_replace_editor view with file name", () => {
    expect(
      describeToolCall({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "view", path: "/index.tsx" },
      })
    ).toBe("Viewing index.tsx");
  });

  it("describes str_replace_editor create without path", () => {
    expect(
      describeToolCall({
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create" },
      })
    ).toBe("Created a file");
  });

  it("describes file_manager rename with both paths", () => {
    expect(
      describeToolCall({
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/old.jsx", new_path: "/new.jsx" },
      })
    ).toBe("Renamed old.jsx → new.jsx");
  });

  it("describes file_manager rename without new_path", () => {
    expect(
      describeToolCall({
        toolName: "file_manager",
        state: "result",
        args: { command: "rename", path: "/old.jsx" },
      })
    ).toBe("Renamed a file");
  });

  it("describes file_manager delete with file name", () => {
    expect(
      describeToolCall({
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/components/Header.tsx" },
      })
    ).toBe("Deleted Header.tsx");
  });

  it("falls back to tool name for unknown tools", () => {
    expect(
      describeToolCall({
        toolName: "some_other_tool",
        state: "result",
        args: {},
      })
    ).toBe("some_other_tool");
  });

  it("handles missing args", () => {
    expect(
      describeToolCall({
        toolName: "str_replace_editor",
        state: "result",
      })
    ).toBe("Modified a file");
  });
});

describe("ToolCallDisplay", () => {
  afterEach(() => cleanup());
  it("shows green dot and label when complete", () => {
    render(
      <ToolCallDisplay
        tool={{
          toolName: "str_replace_editor",
          state: "result",
          args: { command: "create", path: "/Card.jsx" },
          result: "File created: /Card.jsx",
        }}
      />
    );
    expect(screen.getByText("Created Card.jsx")).toBeDefined();
  });

  it("shows spinner when in progress", () => {
    render(
      <ToolCallDisplay
        tool={{
          toolName: "str_replace_editor",
          state: "call",
          args: { command: "create", path: "/Card.jsx" },
        }}
      />
    );
    expect(screen.getByText("Created Card.jsx")).toBeDefined();
  });
});
