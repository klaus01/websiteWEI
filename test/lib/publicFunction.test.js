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

    describe('#getAwardSign()', function(){
        it('getAwardSign(1, 2)=', function(){
            publicFunction.getAwardSign(1, 2).should.equal('5638244976bfd7847b482cb462b717c8');
        });
    });

    describe('#checkAwardSign()', function(){
        it('checkAwardSign(1, 2, "5638244976bfd7847b482cb462b717c8")=true', function(){
            publicFunction.checkAwardSign(1, 2, '5638244976bfd7847b482cb462b717c8').should.be.ok;
        });
    });

    describe('#md5()', function(){
        it('md5(\'xxxxxx\')=dad3a37aa9d50688b5157698acfd7aee', function(){
            publicFunction.md5('xxxxxx').should.equal('dad3a37aa9d50688b5157698acfd7aee');
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