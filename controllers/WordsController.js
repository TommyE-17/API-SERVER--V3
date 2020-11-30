const Repository = require('../models/Repository');
const Word = require('../models/word');
const CollectionFilter = require('../models/collectionFilter');
const { decomposePath } = require('../utilities');

module.exports = 
class WordsController extends require('./Controller') {
    constructor(req, res){
        super(req, res, false /* needAuthorization */);
        this.wordsRepository = new Repository('Words', true /* cached */);
    }
    error(params, message){
        params["error"] = message;
        this.response.JSON(params);
        return false;
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all words sorted by key values (Id, Word, Definition)";
        content += "<h4>? sort=key,desc <br> return all words sorted by descending key values";        
        content += "<h4>page?limit=int&offset=int <br> return limit words of page offset";
        content += "</div>";
        return content;
    }
    queryStringHelp() {
        // expose all the possible query strings
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(this.queryStringParamsList());
    }
    head() {
        console.log(this.wordsRepository.ETag);
        this.response.JSON(null, this.wordsRepository.ETag);
    }
    get(id){
        let params = this.getQueryStringParams(); 
        // if we have no parameter, expose the list of possible query strings
        if (params === null) {
            if(!isNaN(id)) {
                this.response.JSON(this.wordsRepository.get(id));
            }
            else  
                this.response.JSON(this.wordsRepository.getAll());
        }
        else {
            if (Object.keys(params).length === 0) {
                this.queryStringHelp();
            } else {
                let collectionFilter= new CollectionFilter(this.wordsRepository.getAll(), params);
                this.response.JSON(collectionFilter.get(), this.wordsRepository.ETag);
            }
        }
    }
}