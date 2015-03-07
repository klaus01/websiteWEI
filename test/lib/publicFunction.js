var should = require('should');
var path = require('path');
var publicFunction = require('../../lib/publicFunction');

describe('public function', function(){
    describe('#Data.toStandardString()', function(){
        it('应返回2010-01-01 01:02:03          ', function(){
            var dtStr = '2010-01-01 01:02:03';
            var dt = new Date(dtStr);
            result = dt.toStandardString();
            result.should.be.a.String;
            result.should.equal(dtStr);
        });
        it('应返回2010-01-01 01:02:03.00           ', function(){
            var dtStr = '2010-01-01 01:02:03.00';
            var dt = new Date(dtStr);
            result = dt.format('yyyy-MM-dd hh:mm:ss.SS');
            result.should.be.a.String;
            result.should.equal(dtStr);
        });
    });

    describe('#addPartnerUserIconUrl()', function(){
        var rows = [
            {IconFileName: 'x.x'},
            {IconFileName: 'x.x'}
        ];
        it('应返回IconUrl属性            ', function(){
            result = publicFunction.addPartnerUserIconUrl(rows);
            for (var i = 0; i < result.length; i++) {
                result[i].should.have.property('IconUrl');
                result[i].IconUrl.length.should.be.above(0);
            }
        });
        it('IconUrl的文件名应保持不变            ', function(){
            result = publicFunction.addPartnerUserIconUrl(rows);
            for (var i = 0; i < result.length; i++) {
                var filename = path.basename(result[i].IconUrl);
                filename.should.equal(rows[i].IconFileName);
            }
        });
    });

    describe('#addActivityPictureUrl()', function(){
        var rows = [
            {PartnerUserID: 1, PictureFileName: 'x.x'},
            {PartnerUserID: 1, PictureFileName: 'x.x'}
        ];
        it('应返回PictureUrl属性             ', function(){
            result = publicFunction.addActivityPictureUrl(rows);
            for (var i = 0; i < result.length; i++) {
                result[i].should.have.property('PictureUrl');
                result[i].PictureUrl.length.should.be.above(0);
            }
        });
        it('PictureUrl的文件名应保持不变             ', function(){
            result = publicFunction.addActivityPictureUrl(rows);
            for (var i = 0; i < result.length; i++) {
                var filename = path.basename(result[i].PictureUrl);
                filename.should.equal(rows[i].PictureFileName);
            }
        });
    });
});