export namespace auth {
	
	export class AccessToken {
	    token: string;
	    type: string;
	    scope: string;
	
	    static createFrom(source: any = {}) {
	        return new AccessToken(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.token = source["token"];
	        this.type = source["type"];
	        this.scope = source["scope"];
	    }
	}
	export class UserCodeInfo {
	    userCode: string;
	    verificationUri: string;
	    expiresIn: number;
	    interval: number;
	
	    static createFrom(source: any = {}) {
	        return new UserCodeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.userCode = source["userCode"];
	        this.verificationUri = source["verificationUri"];
	        this.expiresIn = source["expiresIn"];
	        this.interval = source["interval"];
	    }
	}

}

