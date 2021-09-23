import * as Fs from "fs";
import * as Geom from "geom-api";
import Block from "../core/Block";
import Domain from "../core/Domain";

export default class MapLoader {
  private domain: Domain;

  constructor(domain: Domain) {
    this.domain = domain;
  }

  public getOrAddBlock(name: string): Block {
    name = name.trim();
    let block: Block = this.domain.getBlock(name);
    if (!block) {
      block = this.domain.addBlock(name);
    }
    return block;
  }

  private isBlock(line: string, parse_state: { block?: Block }): boolean {
    let match = line.match(/^\* (.*)$/);
    if (match && match.length > 1) {
      parse_state.block = this.getOrAddBlock(match[1]);
      return true;
    }
    return false;
  }

  private isConnector(line: string, parse_state: { block?: Block }): boolean {
    let match = line.match(/^ {2}\* (N|NE|E|SE|S|SW|W|NW|U|D): (.*)$/);
    if (match && match.length > 2 && parse_state.block) {
      const from_dir: Geom.Direction = Geom.Direction.get(match[1]);
      const to: Block = this.getOrAddBlock(match[2]);
      parse_state.block.addConnector(to, "one-way", from_dir);
      return true;
    }
    match = line.match(/^ {2}\* C:\s*\[(.*?)\]\((.*)\)$/);
    if (match && match.length > 2 && parse_state.block) {
      parse_state.block.setHoverText(match[1]);
      parse_state.block.setLink(match[2]);
      return true;
    }
    return false;
  }

  private isTitle(line: string, parse_state: any): boolean {
    const match = line.match(/^# (.*)/);
    if (match) {
      this.domain.setTitle(match[1]);
    }
    return !!match;
  }

  public parseContent(content: string) {
    this.parseLines(content.split(/\r\n|\n/));
  }

  public parseLines(lines: string[]) {
    const parse_state: {
      inside_room: boolean;
      block?: Block;
    } = {
      inside_room: false,
    };
    lines.forEach((line) => {
      let done = false;
      done = done || this.isBlock(line, parse_state);
      done = done || this.isConnector(line, parse_state);
      done = done || this.isTitle(line, parse_state);
      if (!done) {
        this.reportError("unused line: " + line);
      }
    });
  }

  public readFile(filename: string) {
    const data = Fs.readFileSync(filename, {
      encoding: "utf8",
    });
    this.parseContent(data);
  }

  private reportError(str: string): void {
    console.log(str); // eslint-disable-line no-console
  }
}
