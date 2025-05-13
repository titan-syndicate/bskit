export namespace auth {
	
	export class Repo {
	    nameWithOwner: string;
	    url: string;
	    pushedAt: string;
	    defaultBranch: string;
	
	    static createFrom(source: any = {}) {
	        return new Repo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nameWithOwner = source["nameWithOwner"];
	        this.url = source["url"];
	        this.pushedAt = source["pushedAt"];
	        this.defaultBranch = source["defaultBranch"];
	    }
	}
	export class UserCodeInfo {
	    deviceCode: string;
	    userCode: string;
	    verificationUri: string;
	    expiresIn: number;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new UserCodeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.deviceCode = source["deviceCode"];
	        this.userCode = source["userCode"];
	        this.verificationUri = source["verificationUri"];
	        this.expiresIn = source["expiresIn"];
	        this.interval = source["interval"];
	    }
	}

}

export namespace repo {
	
	export class RepoStatus {
	    isCloned: boolean;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new RepoStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isCloned = source["isCloned"];
	        this.path = source["path"];
	    }
	}

}

