import "jest";
import * as upload from "./upload";
const uploader = upload;
import * as path from "path";

// tslint:disable-next-line: no-var-requires
const AWS = require("aws-sdk");
import { logger } from "../logger";
describe("S3 Uploads", () => {
  beforeEach(() => {
    AWS.S3 = jest.fn(() => {
      return {
        upload(params: any, cb: any) {
          cb(null, {
            ETag: "etag",
            Location: "mmm",
            Key: "RandomKey",
            Bucket: "TestBucket"
          });
        }
      };
    });
  });

  describe("upload Checker", () => {
    test("all the things", async () => {
      const uploadToS3 = jest.spyOn(uploader, "uploadToS3");
      const spyLogger = jest.spyOn(logger, "log");
      const uploadAll = jest.spyOn(upload, "uploadAll");
      const uploadVideos = jest.spyOn(upload, "uploadVideos");
      const uploadMochaAwesome = jest.spyOn(upload, "uploadMochaAwesome");
      const uploadScreenshots = jest.spyOn(upload, "uploadScreenshots");

      await uploader.uploadAll();
      expect(spyLogger.mock.calls).toHaveLength(11);
      expect(uploadAll).toHaveBeenCalled();
      // expect(uploadVideos).toHaveBeenCalled();
      // expect(uploadMochaAwesome).toHaveBeenCalled();
      // expect(uploadScreenshots).toHaveBeenCalled();
      // expect(uploadToS3).toHaveBeenCalled();
    });
  });
});

interface FoundFile {
  path: string;
  name: string;
  type: string;
}

describe("Get Files Checker", () => {
  test("Returns only specified filetypes if they exist in a dir", async () => {
    const dir: string = path.join(__dirname, "../slack/test/reportSingle");
    const ext: string = ".html";
    const fileList: FoundFile[] = [];
    const s = await uploader.getFiles(dir, ext, fileList);
    const rootDir: string = path.dirname(__dirname);
    expect(s).toEqual([
      {
        name: "report-20190403-233436.html",
        path: `${rootDir}/slack/test/reportSingle/report-20190403-233436.html`,
        type: "html"
      }
    ]);
  });
  test("Returns an empty array if no specified filetypes are found ", async () => {
    const dir: string = path.join(__dirname, "../slack/test/reportSingle");
    const ext: string = ".htm";
    const fileList: FoundFile[] = [];
    const s = await uploader.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });
  test("Returns an empty array if no specified filetypes are found ", async () => {
    const dir: string = path.join(__dirname, "../slack/test/reportSingle");
    const ext: string = ".htm";
    const fileList: FoundFile[] = [];
    const s = await uploader.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });
  test("Returns an empty array if the directory is not found", async () => {
    const dir: string = path.join(__dirname, "../doesntexist");
    const ext: string = ".htm";
    const fileList: FoundFile[] = [];
    const s = await uploader.getFiles(dir, ext, fileList);
    expect(s).toEqual([]);
  });

  test("Can process nested folders", async () => {
    const dir: string = path.join(__dirname, "../slack/test/nestedfolder");
    const ext: string = ".png";
    const fileList: FoundFile[] = [];
    const s = await uploader.getFiles(dir, ext, fileList);
    expect(s).toHaveLength(2);
  });
});
